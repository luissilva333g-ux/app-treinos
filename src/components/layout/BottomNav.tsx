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
          className="fixed bottom-20 left-4 right-4 z-40 bg-gradient-to-r from-emerald-950 via-zinc-900 to-black border border-emerald-500/50 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all animate-pulse-glow backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 animate-spin-slow">
              <Play size={16} fill="currentColor" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Treino em Curso
                </span>
                {savingStatus === 'saving' && (
                  <span className="text-[10px] text-zinc-400 font-mono animate-pulse">• a guardar...</span>
                )}
                {savingStatus === 'saved' && (
                  <span className="text-[10px] text-emerald-400 font-mono">• guardado</span>
                )}
              </div>
              <div className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1">
                <span>Toque para continuar no seu iPhone</span>
                <Sparkles size={12} className="text-amber-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base text-white bg-black/50 px-2.5 py-1 rounded-lg border border-white/10">
              {formattedDuration}
            </span>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO INFERIOR APPLE 2026 */}
      <nav className="bottom-nav border-t border-[rgba(255,255,255,0.08)] bg-[rgba(15,17,23,0.85)]">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item transition-all duration-200 ${
                isActive ? 'text-blue-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all ${
                isActive ? 'bg-blue-500/15 text-blue-400 shadow-md shadow-blue-500/10' : ''
              }`}>
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
