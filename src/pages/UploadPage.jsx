import { useState, useCallback } from 'react';
import { UserList } from '../components/UserList';
import { uploadFile } from '../services/api';
import { formatSize } from '../utils/fileUtils';

export function UploadPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setResult(null); }
  }, []);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) { setFile(e.target.files[0]); setResult(null); }
  };

  const handleUpload = async () => {
    if (!file || !selectedUser) return;
    setUploading(true);
    setProgress(0);
    setResult(null);
    try {
      const data = await uploadFile(file, selectedUser.name, setProgress);
      setResult({
        ok: true,
        msg: `"${data.file.name}" subido a la carpeta de ${selectedUser.name}${data.folderCreated ? ' · carpeta creada automáticamente' : ''}.`,
        link: data.file.webViewLink,
      });
      setFile(null);
    } catch (err) {
      setResult({ ok: false, msg: err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 border-r border-white/[0.06] flex flex-col">
        <div className="px-3 pt-4 pb-2.5">
          <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest px-2">
            Usuarios
          </p>
        </div>
        <UserList selectedUser={selectedUser} onSelect={(u) => { setSelectedUser(u); setResult(null); setFile(null); }} />
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        {!selectedUser ? (
          <EmptySelection />
        ) : (
          <div className="w-full max-w-md space-y-4">

            {/* User badge */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-600/25">
                {selectedUser.initials}
              </div>
              <div>
                <p className="font-semibold text-zinc-100 text-sm leading-tight">{selectedUser.name}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{selectedUser.department} · Archivos en Google Drive</p>
              </div>
            </div>

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                dragging
                  ? 'border-violet-500 bg-violet-600/[0.06] scale-[1.01]'
                  : file
                  ? 'border-violet-500/40 bg-violet-600/[0.04]'
                  : 'border-white/[0.09] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.03]'
              }`}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                disabled={uploading}
              />

              <div className="py-12 px-8 text-center pointer-events-none">
                {file ? (
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center">
                      <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200 truncate">{file.name}</p>
                      <p className="text-xs text-zinc-600 mt-1">{formatSize(file.size)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                      <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-300">Arrastra tu archivo aquí</p>
                      <p className="text-xs text-zinc-600 mt-1">
                        o <span className="text-violet-400">haz clic para explorar</span>
                      </p>
                    </div>
                    <p className="text-xs text-zinc-700">PDF, Word, Excel, imágenes · máx. 20 MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quitar archivo */}
            {file && !uploading && (
              <button
                onClick={() => setFile(null)}
                className="w-full text-xs text-zinc-600 hover:text-red-400 transition-colors py-1"
              >
                Quitar archivo
              </button>
            )}

            {/* Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Subiendo a Google Drive...</span>
                  <span className="text-zinc-400 font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className={`rounded-xl px-4 py-3 text-sm flex items-start gap-3 border ${
                result.ok
                  ? 'bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/[0.08] border-red-500/20 text-red-400'
              }`}>
                {result.ok
                  ? <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  : <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                }
                <div>
                  <p className="leading-relaxed">{result.msg}</p>
                  {result.ok && result.link && (
                    <a href={result.link} target="_blank" rel="noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
                      Ver en Google Drive
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full relative overflow-hidden bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 text-sm shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30"
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Subiendo...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  Subir a Google Drive
                </>
              )}
            </button>

          </div>
        )}
      </main>
    </div>
  );
}

function EmptySelection() {
  return (
    <div className="text-center max-w-xs mx-auto">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-zinc-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-zinc-400">Selecciona un usuario</p>
      <p className="text-xs text-zinc-700 mt-1.5 leading-relaxed">
        Elige un usuario del panel izquierdo para continuar con la carga.
      </p>
    </div>
  );
}
