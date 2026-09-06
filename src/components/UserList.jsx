import { useState } from 'react';
import { USERS } from '../config/config';

const AVATAR_GRADIENTS = [
  'from-violet-500 to-fuchsia-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-blue-500',
  'from-teal-500 to-emerald-500',
  'from-fuchsia-500 to-violet-500',
];

export function UserList({ selectedUser, onSelect }) {
  const [search, setSearch] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const filtered = USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserClick = (user) => {
    setPendingUser(user);
    setPassword('');
    setError(false);
  };

  const handleConfirm = () => {
    if (password === pendingUser.password) {
      onSelect(pendingUser);
      setPendingUser(null);
      setPassword('');
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleCancel = () => {
    setPendingUser(null);
    setPassword('');
    setError(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none"
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-8 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-3">
          {filtered.map((user, i) => {
            const isSelected = selectedUser?.id === user.id;
            const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
            return (
              <button
                key={user.id}
                onClick={() => handleUserClick(user)}
                className={`w-full text-left px-2.5 py-2.5 rounded-xl transition-all duration-150 flex items-center gap-3 group relative ${
                  isSelected
                    ? 'bg-violet-600/[0.12] text-violet-300'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-500 rounded-r-full" />
                )}

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white bg-gradient-to-br ${gradient} ${isSelected ? 'shadow-lg shadow-violet-600/25' : 'opacity-80 group-hover:opacity-100'} transition-opacity`}>
                  {user.initials}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate leading-tight ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>
                    {user.name}
                  </p>
                  <p className="text-xs text-zinc-600 truncate mt-0.5">{user.department}</p>
                </div>

                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-violet-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center py-8 text-zinc-700 text-sm">Sin resultados</p>
          )}
        </div>
      </div>

      {/* Password modal */}
      {pendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/[0.1] rounded-2xl p-6 w-80 shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 bg-gradient-to-br ${AVATAR_GRADIENTS[USERS.indexOf(pendingUser) % AVATAR_GRADIENTS.length]}`}>
                {pendingUser.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">{pendingUser.name}</p>
                <p className="text-xs text-zinc-500">Ingresa tu contraseña para continuar</p>
              </div>
            </div>

            {/* Input */}
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              onKeyDown={handleKeyDown}
              placeholder="Contraseña"
              autoFocus
              className={`w-full bg-white/[0.05] border rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all ${
                error
                  ? 'border-red-500/50 focus:border-red-500/70 bg-red-500/[0.05]'
                  : 'border-white/[0.08] focus:border-violet-500/50 focus:bg-white/[0.07]'
              }`}
            />

            {error && (
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                Contraseña incorrecta
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] text-sm font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!password}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
