import ffmpeg from 'fluent-ffmpeg';
import path from 'node:path';

export function extractAudio(videoPath, outputDir) {
  return new Promise((resolve, reject) => {
    const out = path.join(outputDir, `${path.basename(videoPath)}.mp3`);

    ffmpeg(videoPath)
      .noVideo()
      .audioChannels(1)
      .audioFrequency(16000)
      .audioCodec('libmp3lame')
      .audioBitrate('64k')
      .on('end', () => resolve(out))
      .on('error', (err) => reject(err))
      .save(out);
  });
}