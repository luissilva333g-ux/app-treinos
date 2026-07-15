import React from 'react';
import type { TabType } from '../../types';
import { useWorkout } from '../../context/WorkoutContext';
import { Home, ListOrdered, Dumbbell, History, User, Play, Sparkles } from 'lucide-react';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { activeSession, formattedDuration, savingStatus } = useWorkout();

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Início', icon: <Home size={22} /> },
    { id: 'routines', label: 'Rotinas', icon: <ListOrdered size={22} /> },
    { id: 'exercises', label: 'Biblioteca', icon: <Dumbbell size={22} /> },
    { id: 'history', label: 'Histórico', icon: <History size={22} /> },
    { id: 'profile', label: 'Perfil', icon: <User size={22} /> },
  ];

  return (
    <>
      {/* PONTO 8 & 31: BARRA FLUTUANTE DE TREINO EM CURSO */}
      {activeSession && activeTab !== 'active_workout' && (
        <div 
          onClick={() => setActiveTab('active_workout')}
          className="active-workout-banner"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-emerald-500/25 text-emerald-400 flex items-center justify-center border border-emerald-500/50 animate-spin-slow shrink-0 shadow-lg shadow-emerald-500/20">
              <Play size={16} fill="currentColor" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 truncate">
                  Treino em Curso
                </span>
                {savingStatus === 'saving' && (
                  <span className="text-[10px] text-zinc-300 font-mono animate-pulse shrink-0">• a guardar...</span>
                )}
                {savingStatus === 'saved' && (
                  <span className="text-[10px] text-emerald-400 font-mono shrink-0">• guardado</span>
                )}
              </div>
              <div className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1 truncate">
                <span>Toque para continuar o seu treino</span>
                <Sparkles size={13} className="text-amber-400 shrink-0" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="font-mono font-extrabold text-sm sm:text-base text-white bg-black/60 px-3 py-1.5 rounded-xl border border-white/15 shadow-inner">
              {formattedDuration}
            </span>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO INFERIOR APPLE 2026 */}
      <nav className="apple-bottom-nav select-none">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item transition-all duration-200 ${
                isActive ? 'active scale-105' : 'hover:text-zinc-200'
              }`}
            >
              <div className={`relative px-4 py-1.5 rounded-2xl transition-all flex items-center justify-center ${
                isActive 
                  ? 'bg-gradient-to-tr from-blue-600/30 via-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/35 shadow-lg shadow-blue-500/20' 
                  : 'text-zinc-500 hover:bg-white/5'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[11px] tracking-tight mt-1 font-semibold ${isActive ? 'text-blue-400 font-bold' : 'text-zinc-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
