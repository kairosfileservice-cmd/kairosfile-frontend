import { useState, useEffect, useCallback } from 'react';
import { UserList } from '../components/UserList';
import { fetchFiles, browseFolder, createFolder } from '../services/api';
import { formatSize, formatDate, getFileType, FILE_TYPE_STYLES } from '../utils/fileUtils';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

export function FilesPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]); // [{ id, name }]
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderError, setFolderError] = useState('');

  const currentFolder = breadcrumb[breadcrumb.length - 1] ?? null;

  const loadFolder = useCallback(async (folderId) => {
    setLoading(true);
    setError(null);
    setFiles([]);
    try {
      const data = await browseFolder(folderId);
      setFiles(data.files);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectUser = useCallback(async (user) => {
    setSelectedUser(user);
    setFiles([]);
    setError(null);
    setBreadcrumb([]);
    setLoading(true);
    try {
      const data = await fetchFiles(user.name);
      if (data.folderExists && data.folderId) {
        setBreadcrumb([{ id: data.folderId, name: user.name }]);
        setFiles(data.files);
      } else {
        setBreadcrumb([]);
        setFiles([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEnterFolder = (folder) => {
    const next = [...breadcrumb, { id: folder.id, name: folder.name }];
    setBreadcrumb(next);
    loadFolder(folder.id);
  };

  const handleBreadcrumbClick = (index) => {
    const next = breadcrumb.slice(0, index + 1);
    setBreadcrumb(next);
    loadFolder(next[next.length - 1].id);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    setFolderError('');
    try {
      await createFolder(newFolderName.trim(), currentFolder?.id, selectedUser?.name);
      setNewFolderModal(false);
      setNewFolderName('');
      loadFolder(currentFolder.id);
    } catch (err) {
      setFolderError(err.message);
    } finally {
      setCreatingFolder(false);
    }
  };

  const openNewFolderModal = () => {
    setNewFolderName('');
    setFolderError('');
    setNewFolderModal(true);
  };

  const folders = files.filter((f) => f.mimeType === FOLDER_MIME);
  const onlyFiles = files.filter((f) => f.mimeType !== FOLDER_MIME);

  return (
    <div className="flex h-full min-h-0">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 border-r border-white/[0.06] flex flex-col">
        <div className="px-3 pt-4 pb-2.5">
          <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest px-2">
            Usuarios
          </p>
        </div>
        <UserList selectedUser={selectedUser} onSelect={handleSelectUser} />
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptySelection />
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="px-6 py-3.5 border-b border-white/[0.06] flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 text-sm min-w-0 flex-wrap">
                  {breadcrumb.map((crumb, i) => {
                    const isLast = i === breadcrumb.length - 1;
                    return (
                      <span key={crumb.id} className="flex items-center gap-1 min-w-0">
                        {i > 0 && (
                          <svg className="w-3 h-3 text-zinc-700 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                          </svg>
                        )}
                        {isLast ? (
                          <span className="font-semibold text-zinc-100 truncate max-w-[160px]">{crumb.name}</span>
                        ) : (
                          <button
                            onClick={() => handleBreadcrumbClick(i)}
                            className="text-zinc-500 hover:text-violet-400 transition-colors truncate max-w-[120px]"
                          >
                            {crumb.name}
                          </button>
                        )}
                      </span>
                    );
                  })}
                </nav>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Nueva carpeta */}
                {currentFolder && (
                  <button
                    onClick={openNewFolderModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-500/30 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 text-xs font-medium transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                    </svg>
                    Nueva carpeta
                  </button>
                )}

                {/* View toggle */}
                <div className="bg-white/[0.04] border border-white/[0.07] rounded-lg p-1 flex gap-0.5">
                  <ViewBtn active={viewMode === 'grid'} onClick={() => setViewMode('grid')} title="Cuadrícula">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                    </svg>
                  </ViewBtn>
                  <ViewBtn active={viewMode === 'list'} onClick={() => setViewMode('list')} title="Lista">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </ViewBtn>
                </div>

                <button
                  onClick={() => currentFolder && loadFolder(currentFolder.id)}
                  disabled={loading || !currentFolder}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.04] hover:bg-white/[0.07] text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-all disabled:opacity-40"
                >
                  <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Actualizar
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState message={error} onRetry={() => currentFolder && loadFolder(currentFolder.id)} />
              ) : !currentFolder ? (
                <EmptyFiles userName={selectedUser.name} noFolder />
              ) : files.length === 0 ? (
                <EmptyFiles userName={selectedUser.name} onNewFolder={openNewFolderModal} />
              ) : viewMode === 'grid' ? (
                <div className="space-y-5">
                  {/* Carpetas */}
                  {folders.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-2.5">
                        Carpetas
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {folders.map((f) => (
                          <FolderCard key={f.id} folder={f} onOpen={() => handleEnterFolder(f)} />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Archivos */}
                  {onlyFiles.length > 0 && (
                    <div>
                      {folders.length > 0 && (
                        <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-2.5">
                          Archivos
                        </p>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {onlyFiles.map((f) => <FileCard key={f.id} file={f} />)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {folders.map((f) => (
                    <FolderRow key={f.id} folder={f} onOpen={() => handleEnterFolder(f)} />
                  ))}
                  {onlyFiles.map((f) => <FileRow key={f.id} file={f} />)}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modal nueva carpeta */}
      {newFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/[0.1] rounded-2xl p-6 w-80 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">Nueva carpeta</p>
                <p className="text-xs text-zinc-500 truncate max-w-[160px]">En: {currentFolder?.name}</p>
              </div>
            </div>

            <input
              type="text"
              value={newFolderName}
              onChange={(e) => { setNewFolderName(e.target.value); setFolderError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setNewFolderModal(false); }}
              placeholder="Nombre de la carpeta"
              autoFocus
              className={`w-full bg-white/[0.05] border rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all ${
                folderError
                  ? 'border-red-500/50 focus:border-red-500/70'
                  : 'border-white/[0.08] focus:border-violet-500/50 focus:bg-white/[0.07]'
              }`}
            />

            {folderError && (
              <p className="text-xs text-red-400 mt-2">{folderError}</p>
            )}

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setNewFolderModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] text-sm font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || creatingFolder}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {creatingFolder ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Folder card ─── */
function FolderCard({ folder, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="group relative bg-amber-500/[0.06] border border-amber-500/[0.15] hover:border-amber-500/30 hover:bg-amber-500/[0.1] rounded-2xl p-4 flex flex-col gap-3 transition-all duration-150 text-left w-full"
    >
      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-200 truncate leading-snug" title={folder.name}>
          {folder.name}
        </p>
        <p className="text-[11px] text-zinc-600 mt-1">{formatDate(folder.createdTime)}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 uppercase tracking-wide">
          Carpeta
        </span>
        <svg className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </button>
  );
}

/* ─── Folder row ─── */
function FolderRow({ folder, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="group flex items-center gap-3 bg-amber-500/[0.04] border border-amber-500/[0.12] hover:border-amber-500/25 hover:bg-amber-500/[0.08] rounded-xl px-4 py-2.5 transition-all w-full text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
        </svg>
      </div>
      <p className="flex-1 text-sm font-medium text-zinc-300 truncate min-w-0">{folder.name}</p>
      <span className="text-xs text-zinc-600 hidden md:block shrink-0">{formatDate(folder.createdTime)}</span>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-amber-500/10 text-amber-400 uppercase tracking-wide">
        Carpeta
      </span>
      <svg className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}

/* ─── File card ─── */
function FileCard({ file }) {
  const type = getFileType(file.mimeType, file.name);
  const style = FILE_TYPE_STYLES[type];

  return (
    <div className="group relative bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.05] rounded-2xl p-4 flex flex-col gap-3 transition-all duration-150 cursor-default">
      <div className={`w-10 h-10 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center`}>
        <FileTypeIcon type={type} className={`w-5 h-5 ${style.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-200 truncate leading-snug" title={file.name}>
          {file.name}
        </p>
        <p className="text-[11px] text-zinc-600 mt-1">{formatDate(file.createdTime)}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text} uppercase tracking-wide`}>
          {style.label}
        </span>
        {file.webViewLink && (
          <a href={file.webViewLink} target="_blank" rel="noreferrer"
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/[0.06] hover:bg-violet-600 text-zinc-500 hover:text-white transition-all"
            title="Abrir en Drive">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── File row ─── */
function FileRow({ file }) {
  const type = getFileType(file.mimeType, file.name);
  const style = FILE_TYPE_STYLES[type];

  return (
    <div className="group flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.04] rounded-xl px-4 py-2.5 transition-all">
      <div className={`w-8 h-8 rounded-lg ${style.bg} border ${style.border} flex items-center justify-center shrink-0`}>
        <FileTypeIcon type={type} className={`w-4 h-4 ${style.text}`} />
      </div>
      <p className="flex-1 text-sm font-medium text-zinc-300 truncate min-w-0">{file.name}</p>
      <span className="text-xs text-zinc-600 hidden sm:block shrink-0">{formatSize(file.size)}</span>
      <span className="text-xs text-zinc-600 hidden md:block shrink-0">{formatDate(file.createdTime)}</span>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.bg} ${style.text} uppercase tracking-wide`}>
        {style.label}
      </span>
      {file.webViewLink && (
        <a href={file.webViewLink} target="_blank" rel="noreferrer"
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-violet-400 hover:bg-white/[0.06] transition-all shrink-0"
          title="Abrir en Drive">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      )}
    </div>
  );
}

/* ─── States ─── */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-zinc-600">Cargando...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 max-w-xs mx-auto text-center">
      <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-400">Error al cargar</p>
        <p className="text-xs text-zinc-600 mt-1">{message}</p>
      </div>
      <button onClick={onRetry} className="px-4 py-2 text-xs font-medium bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-zinc-400 transition-all">
        Reintentar
      </button>
    </div>
  );
}

function EmptyFiles({ userName, noFolder, onNewFolder }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 max-w-xs mx-auto text-center">
      <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.07] rounded-2xl flex items-center justify-center">
        <svg className="w-6 h-6 text-zinc-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
        </svg>
      </div>
      {noFolder ? (
        <div>
          <p className="text-sm font-semibold text-zinc-500">{userName} no tiene carpeta aún</p>
          <p className="text-xs text-zinc-700 mt-1">Sube un archivo primero para crear su carpeta.</p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold text-zinc-500">Esta carpeta está vacía</p>
          <p className="text-xs text-zinc-700 mt-1">Sube archivos o crea una subcarpeta.</p>
        </div>
      )}
      {onNewFolder && (
        <button
          onClick={onNewFolder}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-violet-500/30 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 text-xs font-medium transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva carpeta
        </button>
      )}
    </div>
  );
}

function EmptySelection() {
  return (
    <div className="text-center max-w-xs mx-auto">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-zinc-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-zinc-500">Selecciona un usuario</p>
      <p className="text-xs text-zinc-700 mt-1.5">Elige del panel izquierdo para ver sus archivos.</p>
    </div>
  );
}

/* ─── View button helper ─── */
function ViewBtn({ active, onClick, title, children }) {
  return (
    <button onClick={onClick} title={title}
      className={`p-1.5 rounded-md transition-all ${active ? 'bg-white/[0.1] text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'}`}>
      {children}
    </button>
  );
}

/* ─── File type icon ─── */
function FileTypeIcon({ type, className }) {
  const icons = {
    pdf:   <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 14h1.3c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2H9.3V18H8.5v-4zm1 1.8c.3 0 .5-.2.5-.6s-.2-.6-.5-.6h-.7v1.2h.7zm2.5-1.8h1.4c.9 0 1.6.7 1.6 2s-.7 2-1.6 2H12v-4zm1 3.4c.5 0 .8-.4.8-1.4s-.3-1.4-.8-1.4h-.5v2.8h.5zm2.5-3.4h2.3v.7h-1.5v1h1.3v.6h-1.3V18H15v-4z"/></svg>,
    word:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
    excel: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125" /></svg>,
    image: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>,
    video: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>,
    audio: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" /></svg>,
    zip:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>,
    file:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
  };
  return icons[type] ?? icons.file;
}
