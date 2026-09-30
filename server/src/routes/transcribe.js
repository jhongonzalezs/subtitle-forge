import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { extractAudio } from '../services/ffmpeg.js';
import { transcribeWithWhisper } from '../services/whisper.js';
import { translateSegments } from '../services/translator.js';
import { segmentsToSRT } from '../utils/srt.js';
import { createJob, getJob, updateJob, failJob } from '../utils/jobs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

await fs.mkdir(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 2048 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Solo se permiten archivos de video'));
  },
});

const router = Router();

function uploadVideo(req, res, next) {
  upload.single('video')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'El video es demasiado grande. Máximo 2 GB.' });
      }
      return res.status(400).json({ error: `Error de subida: ${err.message}` });
    }
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}

router.post('/', uploadVideo, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún video' });
  }

  const targetLang = req.body.targetLang || 'original';
  const videoPath = req.file.path;
  const jobId = createJob();

  res.json({ jobId });

  (async () => {
    let audioPath = null;
    try {
      updateJob(jobId, {
        progress: 10,
        stage: 'Extrayendo audio del video…',
        timeline: { extract: 'active' },
      });
      audioPath = await extractAudio(videoPath, UPLOAD_DIR);

      updateJob(jobId, {
        progress: 25,
        stage: 'Audio listo. Preparando Whisper…',
        timeline: { extract: 'done', whisper: 'active' },
      });

      const shouldTranslateToEnglish = targetLang === 'en' || targetLang === 'es';

      const result = await transcribeWithWhisper(audioPath, {
        translateToEnglish: shouldTranslateToEnglish,
        onStage: (stage) =>
          updateJob(jobId, {
            stage,
            timeline: { extract: 'done', whisper: 'active' },
          }),
      });

      const detectedLanguage = result.language;
      let finalSegments = result.segments;

      updateJob(jobId, {
        progress: 75,
        stage: `Idioma detectado: ${detectedLanguage}`,
        detectedLanguage,
        segments: finalSegments,
        timeline: { extract: 'done', whisper: 'done', translate: 'active' },
      });

      if (targetLang === 'es') {
        updateJob(jobId, {
          stage: 'Traduciendo inglés → español…',
          progress: 85,
        });
        finalSegments = await translateSegments(finalSegments, 'es', 'en');
        updateJob(jobId, { segments: finalSegments });
      }

      updateJob(jobId, {
        progress: 95,
        stage: 'Generando archivo SRT…',
        timeline: { extract: 'done', whisper: 'done', translate: 'done', srt: 'active' },
      });

      const srt = segmentsToSRT(finalSegments);

      updateJob(jobId, {
        status: 'done',
        progress: 100,
        srt,
        stage: '¡Listo!',
        timeline: { extract: 'done', whisper: 'done', translate: 'done', srt: 'done' },
      });
    } catch (err) {
      console.error('[job error]', err);
      failJob(jobId, err.message || 'Error desconocido');
    } finally {
      fs.unlink(videoPath).catch(() => {});
      if (audioPath) fs.unlink(audioPath).catch(() => {});
    }
  })();
});

router.get('/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job no encontrado' });
  res.json({
    status: job.status,
    progress: job.progress,
    stage: job.stage,
    detectedLanguage: job.detectedLanguage,
    segments: job.segments,
    timeline: job.timeline,
    error: job.error,
  });
});

router.get('/:id/download', (req, res) => {
  const job = getJob(req.params.id);
  if (!job || job.status !== 'done' || !job.srt) {
    return res.status(404).json({ error: 'SRT no disponible' });
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="subtitles.srt"');
  res.send(job.srt);
});

export default router;