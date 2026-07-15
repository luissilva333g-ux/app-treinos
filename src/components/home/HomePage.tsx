import React, { useEffect, useState, useCallback } from 'react';
import type { RoutineWithExercises, WorkoutSession, TabType } from '../../types';
import { DB } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { Play, Plus, ChevronRight } from 'lucide-react';

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

  const firstName = activeProfile?.name.split(' ')[0] || 'Atleta';

  return (
    <div className="p-5 sm:p-6 space-y-6 animate-fade-in pb-16 select-none">
      {/* 1. SAUDAÇÃO LIMPA ESTILO APPLE IOS */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Diário de Treino
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Olá, {firstName}
          </h1>
        </div>
        
        <div 
          onClick={() => setActiveTab('profile')}
          className="w-11 h-11 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-base text-blue-400 cursor-pointer active:scale-95 transition-transform"
        >
          {activeProfile?.name.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>

      {/* 2. CARD PRINCIPAL: TREINO EM CURSO OU TREINO LIVRE */}
      {activeSession ? (
        <div 
          onClick={() => setActiveTab('active_workout')}
          className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-xl cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Treino em Curso
              </span>
            </div>
            <span className="font-mono text-xl font-bold text-white bg-black/40 px-3 py-1 rounded-lg border border-white/10">
              {formattedDuration}
            </span>
          </div>

          <p className="text-sm text-zinc-300 mb-4">
            <strong className="text-white font-bold">{workoutExercises.length}</strong> {workoutExercises.length === 1 ? 'exercício registado' : 'exercícios registados'} na sessão atual
          </p>

          <button
            onClick={() => setActiveTab('active_workout')}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Play size={16} fill="currentColor" /> Retomar Sessão
          </button>
        </div>
      ) : (
        /* HERO CARD DE TREINO LIVRE - LIMPO E INTUITIVO */
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-950/30 to-[#121624] border border-blue-500/30 shadow-xl space-y-4">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">
              Sessão Livre
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Treino sem Rotina
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
              Comece o cronómetro agora e adicione exercícios da biblioteca em tempo real enquanto treina.
            </p>
          </div>

          <button
            onClick={handleStartEmpty}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus size={18} /> Iniciar Treino Livre
          </button>
        </div>
      )}

      {/* 3. AS MINHAS ROTINAS - LISTA NATIVA LIMPA E DIRETA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>As Minhas Rotinas</span>
            <span className="text-xs font-medium bg-white/10 text-zinc-300 px-2 py-0.5 rounded-full">
              {routines.length}
            </span>
          </h2>
          <button
            onClick={() => setActiveTab('routines')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition cursor-pointer"
          >
            Ver todas <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            A carregar rotinas...
          </div>
        ) : routines.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
            <p className="text-xs text-zinc-400">Ainda não criou nenhuma rotina planeada.</p>
            <button
              onClick={() => setActiveTab('routines')}
              className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold px-4 py-2 rounded-xl"
            >
              + Criar Primeira Rotina
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {routines.map(routine => {
              const previewNames = routine.exercises.map(e => e.exercise.name);
              return (
                <div
                  key={routine.id}
                  className="p-4 rounded-xl bg-[#141622] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base truncate">
                      {routine.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">
                      {routine.exercises.length === 0
                        ? 'Sem exercícios'
                        : `${routine.exercises.length} exs: ${previewNames.join(', ')}`}
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartFromRoutine(routine.id)}
                    disabled={Boolean(activeSession)}
                    className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shrink-0 transition ${
                      activeSession
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer'
                    }`}
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Iniciar</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. HISTÓRICO RECENTE - CALMO E MINIMALISTA */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">
            Histórico Recente
          </h2>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition cursor-pointer"
          >
            Ver tudo <ChevronRight size={14} />
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#141622]/60 border border-white/5 text-center text-xs text-zinc-400">
            Ainda não existem treinos registados no histórico.
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map(session => {
              const dateStr = new Date(session.started_at).toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
              const durSec = session.ended_at
                ? Math.max(1, Math.floor((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000))
                : 0;
              const durMin = Math.floor(durSec / 60);
              const durHrs = Math.floor(durMin / 60);
              const durLabel = durHrs > 0 ? `${durHrs}h ${durMin % 60}m` : `${Math.max(1, durMin)}m`;

              return (
                <div
                  key={session.id}
                  onClick={() => setActiveTab('history')}
                  className="p-3.5 rounded-xl bg-[#141622] border border-white/10 flex items-center justify-between cursor-pointer active:scale-98 transition"
                >
                  <div>
                    <div className="font-bold text-white text-sm">Treino Concluído</div>
                    <div className="text-xs text-zinc-400">{dateStr}</div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white/10 text-emerald-400 px-2.5 py-1 rounded-lg">
                    {durLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
