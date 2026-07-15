import React from 'react';
import type { TabType } from '../../types';
import { useWorkout } from '../../context/WorkoutContext';
import { Home, ListOrdered, Dumbbell, History, User, Play, ChevronRight } from 'lucide-react';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { activeSession, formattedDuration } = useWorkout();

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Início', icon: <Home size={20} /> },
    { id: 'routines', label: 'Rotinas', icon: <ListOrdered size={20} /> },
    { id: 'exercises', label: 'Biblioteca', icon: <Dumbbell size={20} /> },
    { id: 'history', label: 'Histórico', icon: <History size={20} /> },
    { id: 'profile', label: 'Perfil', icon: <User size={20} /> },
  ];

  // A barra flutuante de treino em curso SÓ aparece quando o utilizador NÃO está no ecrã do treino NEM no Início
  // (porque no Início já existe o card principal do treino em curso, evitando duplicação confusa!)
  const showFloatingBanner = Boolean(activeSession && activeTab !== 'active_workout' && activeTab !== 'home');

  return (
    <>
      {showFloatingBanner && (
        <div 
          onClick={() => setActiveTab('active_workout')}
          className="active-workout-banner active:scale-98 transition-transform select-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold shrink-0 shadow-md">
              <Play size={14} fill="currentColor" className="ml-0.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-xs font-bold text-white uppercase tracking-wide truncate">
                  Treino em Curso
                </span>
              </div>
              <div className="text-[11px] text-emerald-300 font-medium truncate mt-0.5">
                Toque para regressar ao ecrã principal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="font-mono font-bold text-sm text-white bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
              {formattedDuration}
            </span>
            <ChevronRight size={16} className="text-zinc-400" />
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO INFERIOR APPLE 2026 - LIMPA E MINIMALISTA */}
      <nav className="apple-bottom-nav select-none">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item transition-colors duration-150 ${
                isActive ? 'active' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? 'text-blue-400 scale-105' : 'text-zinc-500'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[10px] sm:text-[11px] tracking-tight ${
                isActive ? 'text-blue-400 font-semibold' : 'text-zinc-500 font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
