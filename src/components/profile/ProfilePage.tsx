import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, LogOut, ShieldAlert, Check, Eye } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, adminInspectedProfile, setInspectedUser, logout, allProfiles } = useAuth();

  if (!currentUser) return null;

  const createdDateStr = new Date(currentUser.created_at).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-6 space-y-6 pb-32 animate-fade-in select-none">
      {/* Header do Perfil */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <User size={26} className="text-blue-400" />
            <span>A minha Conta</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Dados do utilizador autenticado
          </p>
        </div>
      </div>

      {/* Card de Dados Pessoais (Ponto 4.3) */}
      <div className="glass-card p-5 space-y-4 border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-blue-500/20 shrink-0">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">
                {currentUser.name}
              </h2>
              {currentUser.role === 'admin' && (
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                  <ShieldCheck size={12} /> ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              @{currentUser.username}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 font-medium">ID Único:</span>
            <span className="font-mono text-[11px] text-zinc-500">{currentUser.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 font-medium">Nível de Permissão:</span>
            <span className="font-bold uppercase text-white">{currentUser.role === 'admin' ? 'Administrador Total' : 'Utilizador Normal'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 font-medium">Data de Criação:</span>
            <span className="text-zinc-300 font-semibold">{createdDateStr}</span>
          </div>
        </div>

        {/* Botão de Terminar Sessão (Ponto 4.2 e 42) */}
        <button
          onClick={() => {
            if (window.confirm('Tem a certeza que deseja terminar sessão?')) {
              logout();
            }
          }}
          className="btn-danger w-full mt-2 font-bold shadow-lg"
        >
          <LogOut size={16} /> Terminar Sessão
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECÇÃO DE ADMINISTRAÇÃO (PONTO 3.1 & PONTO 40 - APENAS PARA LUÍS)       */}
      {/* ========================================================================= */}
      {currentUser.role === 'admin' && (
        <div className="space-y-4 pt-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert size={20} className="text-amber-400" />
                <span>Administração de Utilizadores</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Consulte e alterne para qualquer utilizador para efeitos de administração sem misturar históricos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {allProfiles.map(profile => {
              const isCurrentlyInspected = adminInspectedProfile?.id === profile.id;
              const isSelf = profile.id === currentUser.id;

              return (
                <div
                  key={profile.id}
                  className={`glass-card p-4 flex items-center justify-between gap-3 transition-all ${
                    isCurrentlyInspected
                      ? 'border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10'
                      : isSelf && !adminInspectedProfile
                      ? 'border-blue-500/40 bg-blue-950/20'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 border ${
                      profile.role === 'admin'
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                        : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base truncate">
                          {profile.name}
                        </span>
                        {profile.role === 'admin' && (
                          <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">
                        @{profile.username}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSelf && !adminInspectedProfile ? (
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                        <Check size={14} /> Minha conta ativa
                      </span>
                    ) : isCurrentlyInspected ? (
                      <button
                        onClick={() => setInspectedUser(null)}
                        className="text-xs font-extrabold bg-amber-500 text-black px-3.5 py-1.5 rounded-full shadow-md active:scale-95 transition"
                      >
                        A visualizar (Sair)
                      </button>
                    ) : (
                      <button
                        onClick={() => setInspectedUser(profile)}
                        className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold hover:bg-white/15"
                      >
                        <Eye size={14} className="text-amber-400" />
                        Aceder / Consultar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
