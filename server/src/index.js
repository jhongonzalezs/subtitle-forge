import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import transcribeRouter from './routes/transcribe.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    whisperBin: process.env.WHISPER_BIN,
    whisperModel: process.env.WHISPER_MODEL,
  });
});

app.use('/api/transcribe', transcribeRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error del servidor' });
});

app.listen(PORT, () => {
  console.log(`✅ Subtitle Forge backend en http://localhost:${PORT}`);
  console.log(`   Whisper bin:   ${process.env.WHISPER_BIN}`);
  console.log(`   Whisper model: ${process.env.WHISPER_MODEL}`);
});