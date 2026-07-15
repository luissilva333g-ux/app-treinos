import React, { useEffect, useState, useCallback } from 'react';
import type { RoutineWithExercises, WorkoutSession, TabType } from '../../types';
import { DB } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { Play, Plus, Dumbbell, History, ChevronRight, Flame, Trophy, Activity, CheckCircle2 } from 'lucide-react';

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
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* 1. CABEÇALHO DE BOAS-VINDAS ESTILO APPLE FITNESS+ */}
      <div className="flex items-center justify-between pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-400">
            <Activity size={14} className="animate-pulse text-blue-400" />
            <span>Diário de Alta Precisão</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Olá, {firstName}</span>
            <span className="text-2xl animate-bounce">👋</span>
          </h1>
        </div>
        
        <div 
          onClick={() => setActiveTab('profile')}
          className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-blue-500/25 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-full h-full bg-[#0d101a] rounded-[14px] flex items-center justify-center font-black text-xl text-white">
            {activeProfile?.name.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      {/* 2. DESTAQUE PRINCIPAL - SESSÃO EM CURSO OU TREINO LIVRE (HERO CARD APPLE 2026) */}
      {activeSession ? (
        <div className="glass-card p-6 sm:p-7 border-emerald-500/50 bg-gradient-to-br from-emerald-950/60 via-[#0d1612] to-[#080d0a] shadow-2xl relative overflow-hidden animate-fade-in group">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="flex items-center gap-2.5 bg-emerald-500/15 border border-emerald-500/40 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-300">
                Treino em Curso
              </span>
            </div>
            <span className="font-mono text-2xl font-black text-white bg-black/60 px-4 py-1.5 rounded-2xl border border-white/15 shadow-inner">
              {formattedDuration}
            </span>
          </div>

          <div className="text-base font-medium text-zinc-200 mb-6 flex items-center gap-2.5 relative z-10">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Dumbbell size={20} />
            </div>
            <div>
              <span className="text-white font-bold text-lg">{workoutExercises.length}</span>{' '}
              <span className="text-zinc-300">
                {workoutExercises.length === 1 ? 'exercício registado' : 'exercícios registados'} na sessão atual
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('active_workout')}
            className="btn-success w-full relative z-10 py-4 text-base font-black tracking-wide shadow-xl shadow-emerald-500/30"
          >
            <Play size={20} fill="black" /> Retomar Sessão no Ecrã Completo
          </button>
        </div>
      ) : (
        /* HERO CARD DE TREINO LIVRE ESTILO APPLE FITNESS+ */
        <div className="glass-card p-6 sm:p-7 bg-gradient-to-br from-[#121c38]/90 via-[#0f1424]/90 to-[#0a0d16] border-blue-500/40 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-14 -right-14 w-64 h-64 bg-blue-500/25 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -bottom-14 -left-14 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-500/35 px-3.5 py-1.5 rounded-full text-blue-300 font-extrabold text-xs uppercase tracking-wider">
              <Flame size={15} className="text-amber-400 animate-pulse" /> Ação Imediata
            </div>
            
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Sessão Livre / Vazia
              </h2>
              <p className="text-sm text-zinc-300 mt-1.5 leading-relaxed max-w-sm">
                Inicie o cronómetro e adicione exercícios da biblioteca em tempo real durante a sua performance no ginásio.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleStartEmpty}
                className="btn-primary w-full py-4 text-base font-black shadow-xl shadow-blue-500/30 tracking-wide group-hover:scale-[1.01] transition-transform"
              >
                <Plus size={22} className="stroke-[3]" /> Iniciar Treino Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ROTINAS PLANEADAS (CARDS PREMIUM COM ESTÉTICA DE ALTA PROFUNDIDADE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              As minhas rotinas
            </h2>
            <span className="text-xs font-black bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2.5 py-0.5 rounded-full">
              {routines.length}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('routines')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <span>Ver todas</span> <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="glass-card p-10 text-center text-zinc-400 text-sm flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>A carregar as suas rotinas de treino...</span>
          </div>
        ) : routines.length === 0 ? (
          <div className="glass-card p-8 text-center text-zinc-300 text-sm space-y-4 bg-gradient-to-b from-white/[0.04] to-transparent border-dashed border-white/20">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 mx-auto flex items-center justify-center text-blue-400">
              <Dumbbell size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Sem rotinas configuradas</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Crie a sua primeira rotina planeada para iniciar rapidamente os treinos com um único toque.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('routines')}
              className="btn-primary text-xs py-3 px-6 font-bold"
            >
              <Plus size={16} /> Criar Nova Rotina
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {routines.map(routine => {
              const exerciseCount = routine.exercises.length;
              const previewNames = routine.exercises.map(e => e.exercise.name);
              
              return (
                <div
                  key={routine.id}
                  className="glass-card p-5 flex items-center justify-between gap-4 border-white/10 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-500/25 to-indigo-600/15 border border-blue-500/35 flex flex-col items-center justify-center text-blue-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      <Dumbbell size={22} />
                      <span className="text-[10px] font-black tracking-tight mt-0.5 text-zinc-300">
                        {exerciseCount} {exerciseCount === 1 ? 'ex' : 'exs'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-extrabold text-white text-lg tracking-tight truncate group-hover:text-blue-400 transition-colors">
                        {routine.name}
                      </h3>
                      <p className="text-xs text-zinc-400 truncate font-medium">
                        {exerciseCount === 0
                          ? 'Nenhum exercício associado'
                          : previewNames.join(' • ')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartFromRoutine(routine.id)}
                    disabled={Boolean(activeSession)}
                    className={`px-5 py-3 rounded-full font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer shadow-md ${
                      activeSession
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/40 hover:brightness-115 shadow-blue-500/25'
                    }`}
                  >
                    <Play size={14} fill="currentColor" />
                    <span>Iniciar</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. HISTÓRICO DE TREINOS (COM EMPTY STATE PREMIADO E CHIC) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy size={20} className="text-amber-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Histórico de Treinos
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <span>Ver tudo</span> <ChevronRight size={14} />
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div className="glass-card p-8 text-center space-y-4 border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <History size={26} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-extrabold text-white">O seu histórico está pronto a iniciar</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Assim que concluir a sua primeira sessão, os seus recordes de peso e evolução de volume serão exibidos aqui com estatísticas detalhadas.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
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
                  className="glass-card p-4.5 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 active:scale-98 transition-all duration-200 group border-white/10"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-base tracking-tight group-hover:text-emerald-400 transition-colors">
                        Treino Concluído
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5 font-medium">
                        {dateStr}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-extrabold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl shadow-inner">
                      {durLabel}
                    </span>
                    <ChevronRight size={16} className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
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
