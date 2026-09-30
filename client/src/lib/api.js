import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export async function startTranscription(file, targetLang, onUploadProgress) {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('targetLang', targetLang);

  const { data } = await api.post('/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onUploadProgress && e.total) {
        onUploadProgress(Math.round((e.loaded / e.total) * 40));
      }
    },
  });

  return data;
}

export async function getJobStatus(jobId) {
  const { data } = await api.get(`/transcribe/${jobId}`);
  return data;
}

export function downloadSRT(jobId) {
  const a = document.createElement('a');
  a.href = `/api/transcribe/${jobId}/download`;
  a.download = 'subtitles.srt';
  document.body.appendChild(a);
  a.click();
  a.remove();
}