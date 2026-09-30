function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

const LANGUAGE_NAMES = {
  en: 'Inglés',
  es: 'Español',
  fr: 'Francés',
  de: 'Alemán',
  it: 'Italiano',
  pt: 'Portugués',
  cs: 'Checo',
  ja: 'Japonés',
  zh: 'Chino',
  ru: 'Ruso',
  auto: 'Auto',
  unknown: 'Desconocido',
};

export default function PreviewPanel({ detectedLanguage, segments }) {
  const hasData = detectedLanguage || (segments && segments.length > 0);

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Vista previa
          </h2>
          {detectedLanguage && (
            <span className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-700 font-medium border border-brand-100">
              🌐 {LANGUAGE_NAMES[detectedLanguage] || detectedLanguage}
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {!hasData && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <svg
              className="w-12 h-12 text-slate-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <p className="text-sm text-slate-500">
              Aquí verás los subtítulos generados
            </p>
            <p className="text-xs text-slate-400">
              Sube un video para empezar
            </p>
          </div>
        )}

        {segments &&
          segments.map((seg, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono text-brand-600 font-medium">
                  {formatTime(seg.start)}
                </span>
                <span className="text-xs text-slate-300">→</span>
                <span className="text-xs font-mono text-brand-600 font-medium">
                  {formatTime(seg.end)}
                </span>
                <span className="text-xs text-slate-400 ml-auto">
                  #{i + 1}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {seg.text}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}