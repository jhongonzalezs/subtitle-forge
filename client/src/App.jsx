import { useState } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import LanguageSelect from './components/LanguageSelect';
import ProgressBar from './components/ProgressBar';
import PreviewPanel from './components/PreviewPanel';
import Timeline from './components/Timeline';
import { startTranscription, getJobStatus, downloadSRT } from './lib/api';

export default function App() {
  const [file, setFile] = useState(null);
  const [lang, setLang] = useState('original');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState('Procesando…');
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [timeline, setTimeline] = useState(null);

  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [segments, setSegments] = useState([]);
  const [jobId, setJobId] = useState(null);

  const reset = () => {
    setProgress(0);
    setStatusLabel('Procesando…');
    setError(null);
    setDone(false);
    setTimeline(null);
    setDetectedLanguage(null);
    setSegments([]);
    setJobId(null);
  };

  const handleGenerate = async () => {
    if (!file || loading) return;
    setLoading(true);
    reset();
    setStatusLabel('Subiendo video…');

    try {
      const { jobId: newJobId } = await startTranscription(
        file,
        lang,
        setProgress,
      );
      setJobId(newJobId);
      setStatusLabel('Subiendo video…');

      const MAX_ATTEMPTS = 1800;
      let attempt = 0;

      while (attempt < MAX_ATTEMPTS) {
        const job = await getJobStatus(newJobId);

        if (job.detectedLanguage) setDetectedLanguage(job.detectedLanguage);
        if (job.segments && job.segments.length) setSegments(job.segments);
        if (job.timeline) setTimeline(job.timeline);

        if (job.status === 'done') {
          setProgress(100);
          setStatusLabel('¡Listo!');
          setDone(true);
          break;
        }

        if (job.status === 'error') {
          throw new Error(job.error || 'La transcripción falló');
        }

        const mapped = 40 + (job.progress || 0) * 0.55;
        setProgress(mapped);

        if (job.stage) setStatusLabel(job.stage);

        await new Promise((r) => setTimeout(r, 2000));
        attempt++;
      }

      if (attempt >= MAX_ATTEMPTS) {
        throw new Error('Tiempo de espera agotado');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (jobId) downloadSRT(jobId);
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="max-w-xl mx-auto">
          <Header />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Columna izquierda: controles */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-6 space-y-5 border border-slate-100">
              <UploadZone file={file} onFile={setFile} />

              <LanguageSelect value={lang} onChange={setLang} />

              <button
                onClick={handleGenerate}
                disabled={!file || loading}
                className="w-full py-3 rounded-xl font-medium text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-150 shadow-sm hover:shadow-md"
              >
                {loading
                  ? 'Generando…'
                  : done
                    ? 'Generar de nuevo'
                    : 'Generar subtítulos'}
              </button>

              {loading && (
                <ProgressBar value={progress} label={statusLabel} />
              )}

              {done && !loading && (
                <div className="space-y-3">
                  <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                    ✅ Subtítulos listos
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full py-3 rounded-xl font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-all duration-150"
                  >
                    📥 Descargar subtitles.srt
                  </button>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Timeline debajo de los controles */}
            {timeline && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Progreso
                </h3>
                <Timeline timeline={timeline} />
              </div>
            )}

            <p className="text-center text-xs text-slate-400">
              Whisper local · Gratis · Sin subir tu video a ningún servidor
            </p>
          </div>

          {/* Columna derecha: preview */}
          <div className="lg:col-span-3 min-h-[500px]">
            <PreviewPanel
              detectedLanguage={detectedLanguage}
              segments={segments}
            />
          </div>
        </div>
      </div>
    </main>
  );
}