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
    { id: 'home', label: 'Início', icon: <Home size={20} /> },
    { id: 'routines', label: 'Rotinas', icon: <ListOrdered size={20} /> },
    { id: 'exercises', label: 'Biblioteca', icon: <Dumbbell size={20} /> },
    { id: 'history', label: 'Histórico', icon: <History size={20} /> },
    { id: 'profile', label: 'Perfil', icon: <User size={20} /> },
  ];

  return (
    <>
      {/* PONTO 8 & 31: BARRA FLUTUANTE DE TREINO EM CURSO (SE HOUVER SESSÃO ATIVA E NÃO ESTIVER NO ECRÃ DO TREINO) */}
      {activeSession && activeTab !== 'active_workout' && (
        <div 
          onClick={() => setActiveTab('active_workout')}
          className="active-workout-banner"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 animate-spin-slow shrink-0">
              <Play size={15} fill="currentColor" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 truncate">
                  Treino em Curso
                </span>
                {savingStatus === 'saving' && (
                  <span className="text-[10px] text-zinc-400 font-mono animate-pulse shrink-0">• a guardar...</span>
                )}
                {savingStatus === 'saved' && (
                  <span className="text-[10px] text-emerald-400 font-mono shrink-0">• guardado</span>
                )}
              </div>
              <div className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1 truncate">
                <span>Toque para continuar</span>
                <Sparkles size={12} className="text-amber-400 shrink-0" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="font-mono font-bold text-sm sm:text-base text-white bg-black/50 px-2.5 py-1 rounded-lg border border-white/10 shadow-inner">
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
                isActive ? 'active scale-105' : 'hover:text-zinc-300'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-blue-500/15 text-blue-400 shadow-md shadow-blue-500/10' : ''
              }`}>
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
