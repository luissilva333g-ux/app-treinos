import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { Wifi, Battery, ShieldAlert, ArrowLeft, CloudCheck, CloudUpload } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, adminInspectedProfile, setInspectedUser } = useAuth();
  const { savingStatus } = useWorkout();

  const currentTime = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="sticky top-0 z-50 select-none">
      {/* Barra de Estado Apple iPhone 15 Pro com Proteção de Notch / Safe Area */}
      <div 
        className="bg-[#000000]/95 backdrop-blur-md px-4 sm:px-6 pb-2.5 flex items-center justify-between text-xs font-semibold border-b border-[rgba(255,255,255,0.06)]"
        style={{ paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-zinc-300">{currentTime}</span>
        </div>
        
        {/* Dynamic Island decorativo / indicador de autosave */}
        <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.08)] px-3 py-1 rounded-full border border-[rgba(255,255,255,0.1)] shadow-inner">
          {savingStatus === 'saving' && (
            <span className="text-[10px] text-amber-400 flex items-center gap-1.5 animate-pulse">
              <CloudUpload size={11} /> A guardar...
            </span>
          )}
          {savingStatus === 'saved' && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1.5">
              <CloudCheck size={11} /> Guardado
            </span>
          )}
          {savingStatus === 'idle' && (
            <span className="text-[10px] text-zinc-300 font-bold tracking-tight">
              App de Treinos 2026
            </span>
          )}
          {savingStatus === 'error' && (
            <span className="text-[10px] text-rose-400 flex items-center gap-1">
              Sem ligação
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-zinc-300">
          <Wifi size={13} />
          <Battery size={15} />
        </div>
      </div>

      {/* Banner Administrativo quando Luís está a inspecionar outra conta (Ponto 40) */}
      {currentUser?.role === 'admin' && adminInspectedProfile && (
        <div className="admin-inspect-banner shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert size={16} className="shrink-0" />
            <span className="truncate">A visualizar: <strong>{adminInspectedProfile.name}</strong></span>
          </div>
          <button
            onClick={() => setInspectedUser(null)}
            className="flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-xs font-bold active:scale-95 transition-transform shrink-0 ml-2"
          >
            <ArrowLeft size={12} /> Sair
          </button>
        </div>
      )}
    </header>
  );
};
