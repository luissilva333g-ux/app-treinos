import React, { useEffect, useState, useCallback } from 'react';
import type { RoutineWithExercises, WorkoutSession, TabType } from '../../types';
import { DB } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { Play, Plus, Dumbbell, History, ChevronRight, Flame, Sparkles } from 'lucide-react';

interface HomePageProps {
  setActiveTab: (tab: TabType) => void;
  onSelectRoutineForDetail?: (routine: RoutineWithExercises) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  const { activeUserId, activeProfile } = useAuth();
  const { activeSession, formattedDuration, startEmptyWorkout, startRoutineWorkout, workoutExercises } = useWorkout();

  const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadHomeData = useCallback(async () => {
    if (!activeUserId) return;
    setLoading(true);
    const [userRoutines, completed] = await Promise.all([
      DB.getRoutines(activeUserId),
      DB.getCompletedSessions(activeUserId)
    ]);
    setRoutines(userRoutines);
    setRecentSessions(completed.slice(0, 3));
    setLoading(false);
  }, [activeUserId]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const handleStartEmpty = async () => {
    await startEmptyWorkout();
    setActiveTab('active_workout');
  };

  const handleStartFromRoutine = async (routineId: string) => {
    await startRoutineWorkout(routineId);
    setActiveTab('active_workout');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Boas-Vindas */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
            <Sparkles size={12} /> Diário de Treino
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
            Olá, {activeProfile?.name.split(' ')[0] || 'Atleta'}
          </h1>
        </div>
        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20">
          {activeProfile?.name.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>

      {/* 1. SE EXISTIR TREINO EM CURSO - DESTAQUE MÁXIMO (Ponto 7) */}
      {activeSession ? (
        <div className="glass-card p-5 border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-zinc-900/80 to-zinc-950 shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
                Treino em Curso
              </span>
            </div>
            <span className="font-mono text-xl font-bold text-white bg-black/50 px-3 py-1 rounded-xl border border-white/10">
              {formattedDuration}
            </span>
          </div>

          <div className="text-sm text-zinc-300 mb-5 flex items-center gap-2 relative z-10">
            <Dumbbell size={16} className="text-emerald-400" />
            <span>
              <strong>{workoutExercises.length}</strong> {workoutExercises.length === 1 ? 'exercício adicionado' : 'exercícios adicionados'} na sessão
            </span>
          </div>

          <button
            onClick={() => setActiveTab('active_workout')}
            className="btn-success w-full relative z-10"
          >
            <Play size={18} fill="black" /> Continuar Treino
          </button>
        </div>
      ) : (
        /* 2. AÇÃO PRINCIPAL - INICIAR TREINO VAZIO (Ponto 7) */
        <div className="glass-card p-6 bg-gradient-to-br from-blue-950/40 via-zinc-900/80 to-zinc-950 border-blue-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Flame size={15} /> Ação de Treino
            </div>
            <h2 className="text-xl font-bold text-white">
              Sessão Livre / Vazia
            </h2>
            <p className="text-xs text-zinc-400 mt-1 mb-5 leading-relaxed">
              Comece agora o seu cronómetro e adicione exercícios da biblioteca à medida que avança.
            </p>

            <button
              onClick={handleStartEmpty}
              className="btn-primary w-full shadow-xl shadow-blue-500/25 font-bold"
            >
              <Plus size={20} /> Iniciar Treino
            </button>
          </div>
        </div>
      )}

      {/* 3. AS MINHAS ROTINAS (Ponto 7) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>As minhas rotinas</span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-zinc-300">
              {routines.length}
            </span>
          </h2>
          <button
            onClick={() => setActiveTab('routines')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
          >
            Ver todas <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            A carregar rotinas...
          </div>
        ) : routines.length === 0 ? (
          <div className="glass-card p-6 text-center text-zinc-400 text-xs space-y-3">
            <p>Ainda não tem rotinas guardadas.</p>
            <button
              onClick={() => setActiveTab('routines')}
              className="btn-secondary text-xs py-2 px-4"
            >
              + Criar a minha primeira rotina
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {routines.map(routine => (
              <div
                key={routine.id}
                className="glass-card p-4 flex items-center justify-between gap-3 border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base truncate">
                    {routine.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">
                    {routine.exercises.length === 0
                      ? 'Sem exercícios'
                      : routine.exercises.map(e => e.exercise.name).join(' • ')}
                  </p>
                </div>

                <button
                  onClick={() => handleStartFromRoutine(routine.id)}
                  disabled={Boolean(activeSession)}
                  className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 shrink-0 ${
                    activeSession
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                      : 'bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/30 shadow-lg shadow-blue-500/10'
                  }`}
                >
                  <Play size={13} fill="currentColor" /> Iniciar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. HISTÓRICO RECENTE (Resumo Rápido) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <History size={18} className="text-zinc-400" />
            <span>Histórico de Treinos</span>
          </h2>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
          >
            Completo <ChevronRight size={14} />
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div className="glass-card p-5 text-center text-zinc-500 text-xs">
            Ainda não existem treinos no histórico.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentSessions.map(session => {
              const dateStr = new Date(session.started_at).toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              });
              const durSec = session.ended_at
                ? Math.max(1, Math.floor((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000))
                : 0;
              const durMin = Math.floor(durSec / 60);
              const durHrs = Math.floor(durMin / 60);
              const durLabel = durHrs > 0 ? `${durHrs}h ${durMin % 60}min` : `${Math.max(1, durMin)}min`;

              return (
                <div
                  key={session.id}
                  onClick={() => setActiveTab('history')}
                  className="glass-card p-3.5 flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
                >
                  <div>
                    <div className="font-bold text-white text-sm">
                      Treino Concluído
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {dateStr}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold bg-white/10 text-emerald-400 px-2.5 py-1 rounded-full">
                      {durLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
