import { useCallback, useState } from 'react';

export default function UploadZone({ file, onFile }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f && f.type.startsWith('video/')) onFile(f);
    },
    [onFile],
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center gap-3
        w-full h-48 rounded-2xl border-2 border-dashed cursor-pointer
        transition-all duration-200
        ${
          dragging
            ? 'border-brand-500 bg-brand-50 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-brand-500 hover:bg-slate-50'
        }
      `}
    >
      <input
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />

      <svg
        className={`w-10 h-10 transition-colors ${
          dragging ? 'text-brand-500' : 'text-slate-400'
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
        />
      </svg>

      {file ? (
        <div className="text-center px-4">
          <p className="text-sm font-medium text-slate-800 break-all">
            {file.name}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">
            Arrastra un video aquí
          </p>
          <p className="text-xs text-slate-500 mt-1">
            o haz clic para seleccionar
          </p>
        </div>
      )}
    </label>
  );
}