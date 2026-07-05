export function Header({ page, onChangePage }) {
  return (
    <header className="border-b border-white/[0.06] bg-black/50 backdrop-blur-2xl px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          </svg>
        </div>
        <span className="font-semibold text-zinc-100 tracking-tight">KairosFile</span>
        <span className="hidden sm:block w-px h-4 bg-white/10" />
        <span className="hidden sm:block text-xs text-zinc-600">Gestión de documentos</span>
      </div>

      {/* Nav — segmented control */}
      <div className="bg-white/[0.04] p-1 rounded-xl border border-white/[0.07] flex gap-0.5">
        <NavTab
          active={page === 'upload'}
          onClick={() => onChangePage('upload')}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12" />
            </svg>
          }
          label="Subir archivos"
        />
        <NavTab
          active={page === 'files'}
          onClick={() => onChangePage('files')}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            </svg>
          }
          label="Ver archivos"
        />
      </div>

      {/* Spacer */}
      <div className="w-40 hidden sm:block" />
    </header>
  );
}

function NavTab({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/40'
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
