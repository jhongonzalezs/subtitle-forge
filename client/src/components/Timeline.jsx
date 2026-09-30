const STEPS = [
  { key: 'extract', label: 'Extrayendo audio', icon: '🎵' },
  { key: 'whisper', label: 'Transcribiendo con Whisper', icon: '🧠' },
  { key: 'translate', label: 'Traduciendo', icon: '🌐' },
  { key: 'srt', label: 'Generando SRT', icon: '📄' },
];

export default function Timeline({ timeline }) {
  if (!timeline) return null;

  return (
    <div className="space-y-2">
      {STEPS.map((step) => {
        const state = timeline[step.key] || 'pending';
        const isActive = state === 'active';
        const isDone = state === 'done';

        return (
          <div
            key={step.key}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              transition-all duration-200
              ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : isDone
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-50 text-slate-400'
              }
            `}
          >
            <span className="text-base">{step.icon}</span>
            <span className="flex-1">{step.label}</span>
            <span className="text-xs">
              {isDone ? '✓' : isActive ? '⏳' : '·'}
            </span>
          </div>
        );
      })}
    </div>
  );
}