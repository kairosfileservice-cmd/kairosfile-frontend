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

  const filtered = USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
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
              onClick={() => onSelect(user)}
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
  );
}
