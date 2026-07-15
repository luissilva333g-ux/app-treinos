import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { Wifi, Battery, ShieldAlert, ArrowLeft, CloudCheck, CloudUpload, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, adminInspectedProfile, setInspectedUser } = useAuth();
  const { savingStatus } = useWorkout();

  const currentTime = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="sticky top-0 z-50 select-none">
      {/* Barra de Estado Apple iPhone 15 Pro com Proteção de Notch / Safe Area */}
      <div 
        className="bg-[#05070f]/90 backdrop-blur-2xl px-5 pb-3 flex items-center justify-between text-xs font-semibold border-b border-white/[0.08]"
        style={{ paddingTop: 'calc(14px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-extrabold text-white tracking-tight">{currentTime}</span>
        </div>
        
        {/* Dynamic Island decorativo / indicador de autosave */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-white/[0.12] to-white/[0.06] px-3.5 py-1.5 rounded-full border border-white/[0.16] shadow-md backdrop-blur-xl">
          {savingStatus === 'saving' && (
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 animate-pulse">
              <CloudUpload size={13} /> A guardar...
            </span>
          )}
          {savingStatus === 'saved' && (
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
              <CloudCheck size={13} /> Guardado
            </span>
          )}
          {savingStatus === 'idle' && (
            <span className="text-[11px] font-bold text-zinc-200 tracking-tight flex items-center gap-1.5">
              <span>App de Treinos 2026</span>
              <Sparkles size={11} className="text-blue-400 animate-pulse" />
            </span>
          )}
          {savingStatus === 'error' && (
            <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
              Sem ligação
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-zinc-300">
          <Wifi size={15} />
          <Battery size={17} />
        </div>
      </div>

      {/* Banner Administrativo quando Luís está a inspecionar outra conta (Ponto 40) */}
      {currentUser?.role === 'admin' && adminInspectedProfile && (
        <div className="admin-inspect-banner animate-fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert size={18} className="shrink-0" />
            <span className="truncate text-sm">A visualizar: <strong>{adminInspectedProfile.name}</strong></span>
          </div>
          <button
            onClick={() => setInspectedUser(null)}
            className="flex items-center gap-1.5 bg-black text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold active:scale-95 transition-transform shrink-0 ml-2 shadow-sm cursor-pointer border border-white/20"
          >
            <ArrowLeft size={14} /> Sair do Modo
          </button>
        </div>
      )}
    </header>
  );
};
