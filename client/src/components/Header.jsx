export default function Header() {
  return (
    <header className="text-center space-y-2">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white shadow-md">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5l4.72-2.36A.75.75 0 0121.75 9v6a.75.75 0 01-1.28.86l-4.72-2.36m-9.5-3.75h9a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5v-6a1.5 1.5 0 011.5-1.5z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold text-slate-900">Subtitle Forge</h1>
      <p className="text-sm text-slate-500">
        Convierte cualquier video en subtítulos <code className="bg-slate-100 px-1 rounded text-xs">.srt</code> con IA local, gratis y sin subirlo a la nube
      </p>
    </header>
  );
}