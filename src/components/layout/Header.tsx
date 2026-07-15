import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { Wifi, Battery, ShieldAlert, ArrowLeft, CloudCheck, CloudUpload } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, adminInspectedProfile, setInspectedUser } = useAuth();
  const { savingStatus } = useWorkout();

  const currentTime = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="sticky top-0 z-50 select-none bg-[#05070f]/90 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Barra de Estado Apple iPhone 15 Pro limpa e minimalista */}
      <div 
        className="px-5 pb-2.5 flex items-center justify-between text-xs font-semibold"
        style={{ paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-zinc-300">{currentTime}</span>
        </div>
        
        {/* Indicador discreto de estado no centro */}
        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[11px]">
          {savingStatus === 'saving' && (
            <span className="text-amber-400 flex items-center gap-1 font-medium">
              <CloudUpload size={12} /> Guardar...
            </span>
          )}
          {savingStatus === 'saved' && (
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CloudCheck size={12} /> Guardado
            </span>
          )}
          {savingStatus === 'idle' && (
            <span className="text-zinc-400 font-medium tracking-tight">
              Registo de Treinos
            </span>
          )}
          {savingStatus === 'error' && (
            <span className="text-rose-400 font-medium">
              Offline
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400">
          <Wifi size={14} />
          <Battery size={16} />
        </div>
      </div>

      {/* Banner Administrativo quando Luís está a inspecionar outra conta */}
      {currentUser?.role === 'admin' && adminInspectedProfile && (
        <div className="bg-gradient-to-r from-amber-600 to-red-600 text-black font-bold text-xs py-1.5 px-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldAlert size={15} className="shrink-0" />
            <span className="truncate">A inspecionar: <strong>{adminInspectedProfile.name}</strong></span>
          </div>
          <button
            onClick={() => setInspectedUser(null)}
            className="flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-[11px] font-bold active:scale-95 transition-transform shrink-0 ml-2"
          >
            <ArrowLeft size={12} /> Sair
          </button>
        </div>
      )}
    </header>
  );
};
