import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.resolve(__dirname, '../..');

export async function transcribeWithWhisper(audioPath, options = {}) {
  const { translateToEnglish = false, onStage } = options;

  const whisperBin = path.resolve(SERVER_ROOT, process.env.WHISPER_BIN);
  const whisperModel = path.resolve(SERVER_ROOT, process.env.WHISPER_MODEL);

  try {
    await fs.access(whisperBin);
  } catch {
    throw new Error(`Binario de whisper no encontrado: ${whisperBin}`);
  }
  try {
    await fs.access(whisperModel);
  } catch {
    throw new Error(`Modelo de whisper no encontrado: ${whisperModel}`);
  }

  const outBase = audioPath;
  const jsonOut = `${outBase}.json`;
  await fs.unlink(jsonOut).catch(() => {});

  const args = [
    '-m', whisperModel,
    '-f', audioPath,
    '-oj',
    '-of', outBase,
    '-l', 'auto',
    '-pp', // print progress -> emite progreso por stderr
  ];

  if (translateToEnglish) {
    args.push('-tr');
  }

  if (onStage) onStage('Cargando modelo Whisper en memoria…');

  await new Promise((resolve, reject) => {
    const child = spawn(whisperBin, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    let stderrBuffer = '';
    let progressRegex = /progress\s*=\s*(\d+)%/;

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderrBuffer += text;

      // Detectar progreso interno de whisper y propagarlo
      const match = text.match(progressRegex);
      if (match && onStage) {
        const pct = parseInt(match[1], 10);
        onStage(`Transcribiendo… (${pct}%)`);
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Error ejecutando whisper: ${err.message}`));
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`whisper salió con código ${code}. ${stderrBuffer.slice(-500)}`));
      } else {
        resolve();
      }
    });
  });

  if (onStage) onStage('Leyendo resultado…');

  let raw;
  try {
    raw = await fs.readFile(jsonOut, 'utf8');
  } catch {
    throw new Error('whisper no generó el archivo JSON esperado');
  }

  const parsed = JSON.parse(raw);
  const detectedLanguage = parsed?.result?.language || 'unknown';

  const segments = (parsed.transcription || []).map((seg) => {
    let start = 0;
    let end = 0;

    if (seg.timestamps) {
      start = parseSRTTime(seg.timestamps.from);
      end = parseSRTTime(seg.timestamps.to);
    } else if (seg.offsets) {
      start = seg.offsets.from / 1000;
      end = seg.offsets.to / 1000;
    }

    return {
      start,
      end,
      text: (seg.text || '').trim(),
    };
  });

  await fs.unlink(jsonOut).catch(() => {});

  return { language: detectedLanguage, segments };
}

function parseSRTTime(str) {
  if (!str) return 0;
  const m = str.match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  if (!m) return 0;
  const [, h, mm, ss, ms] = m;
  return (
    parseInt(h, 10) * 3600 +
    parseInt(mm, 10) * 60 +
    parseInt(ss, 10) +
    parseInt(ms, 10) / 1000
  );
}