import React, { useState, useEffect, useCallback } from 'react';
import type { RoutineWithExercises, TabType } from '../../types';
import { DB } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { RoutineEditorModal } from './RoutineEditorModal';
import { Plus, ListOrdered, Play, Edit3, Trash2, Dumbbell, Sparkles } from 'lucide-react';

interface RoutinesPageProps {
  setActiveTab: (tab: TabType) => void;
}

export const RoutinesPage: React.FC<RoutinesPageProps> = ({ setActiveTab }) => {
  const { activeUserId } = useAuth();
  const { activeSession, startRoutineWorkout } = useWorkout();

  const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [routineToEdit, setRoutineToEdit] = useState<RoutineWithExercises | null>(null);
  const [routineToDelete, setRoutineToDelete] = useState<RoutineWithExercises | null>(null);

  const loadRoutines = useCallback(async () => {
    if (!activeUserId) return;
    setLoading(true);
    const list = await DB.getRoutines(activeUserId);
    setRoutines(list);
    setLoading(false);
  }, [activeUserId]);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const handleStartWorkout = async (routineId: string) => {
    if (activeSession) {
      setActiveTab('active_workout');
      return;
    }
    await startRoutineWorkout(routineId);
    setActiveTab('active_workout');
  };

  const handleConfirmDelete = async () => {
    if (routineToDelete) {
      await DB.deleteRoutine(routineToDelete.id);
      setRoutineToDelete(null);
      loadRoutines();
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 pb-32 animate-fade-in select-none">
      {/* Header com botão de + Nova rotina (Ponto 25) */}
      <div className="flex items-center justify-between pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-400">
            <Sparkles size={14} className="text-blue-400" />
            <span>Biblioteca de Rotinas</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>As Minhas Rotinas</span>
          </h1>
        </div>

        <button
          onClick={() => {
            setRoutineToEdit(null);
            setIsEditorOpen(true);
          }}
          className="btn-primary text-xs py-3 px-5 font-extrabold shadow-lg shadow-blue-500/25 shrink-0 cursor-pointer"
        >
          <Plus size={18} className="stroke-[3]" /> Nova Rotina
        </button>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-zinc-400 text-sm flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>A carregar as suas rotinas de treino...</span>
        </div>
      ) : routines.length === 0 ? (
        <div className="glass-card p-10 text-center space-y-5 border-dashed border-white/20 bg-gradient-to-b from-white/[0.04] to-transparent">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/35 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/15">
            <ListOrdered size={32} />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-extrabold text-white text-lg">Ainda não existem rotinas</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Crie a sua primeira rotina selecionando exercícios da biblioteca para iniciar treinos em segundos.
            </p>
          </div>
          <button
            onClick={() => {
              setRoutineToEdit(null);
              setIsEditorOpen(true);
            }}
            className="btn-primary text-xs py-3.5 px-7 font-black tracking-wide"
          >
            <Plus size={18} className="stroke-[3]" /> Criar a Minha Primeira Rotina
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4.5">
          {routines.map(routine => (
            <div
              key={routine.id}
              className="glass-card p-5 sm:p-6 space-y-5 border-white/10 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/25 to-indigo-600/15 border border-blue-500/35 flex flex-col items-center justify-center text-blue-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <Dumbbell size={24} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-black text-white text-xl tracking-tight truncate group-hover:text-blue-400 transition-colors">
                      {routine.name}
                    </h3>
                    <div className="text-xs text-zinc-400 flex items-center gap-2 font-semibold">
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-zinc-300">
                        {routine.exercises.length} {routine.exercises.length === 1 ? 'exercício' : 'exercícios'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setRoutineToEdit(routine);
                      setIsEditorOpen(true);
                    }}
                    title="Editar rotina"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 transition cursor-pointer border border-white/10"
                  >
                    <Edit3 size={17} />
                  </button>

                  <button
                    onClick={() => setRoutineToDelete(routine)}
                    title="Eliminar rotina"
                    className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition cursor-pointer border border-rose-500/30"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              {/* Lista dos primeiros exercícios na rotina */}
              <div className="bg-black/50 rounded-2xl p-4 space-y-2 border border-white/10 shadow-inner">
                {routine.exercises.length === 0 ? (
                  <span className="text-xs text-zinc-500 italic block py-1">Sem exercícios adicionados</span>
                ) : (
                  routine.exercises
                    .sort((a, b) => a.position - b.position)
                    .slice(0, 4)
                    .map((re, idx) => (
                      <div key={re.routineExerciseId} className="flex items-center justify-between text-xs text-zinc-300 py-0.5 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono font-bold text-blue-400 w-5 text-center bg-blue-500/10 rounded py-0.5">{idx + 1}</span>
                          <span className="font-bold truncate text-zinc-200">{re.exercise.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 ml-2">
                          {re.exercise.muscle_group}
                        </span>
                      </div>
                    ))
                )}
                {routine.exercises.length > 4 && (
                  <div className="text-xs font-bold text-blue-400 pl-7 pt-1 flex items-center gap-1">
                    <span>+ {routine.exercises.length - 4} mais exercícios na rotina</span>
                  </div>
                )}
              </div>

              {/* Botão de Iniciar Treino (Ponto 9) */}
              <button
                onClick={() => handleStartWorkout(routine.id)}
                disabled={Boolean(activeSession)}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg transition tracking-wide cursor-pointer ${
                  activeSession
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                    : 'btn-primary shadow-blue-500/30'
                }`}
              >
                <Play size={18} fill="currentColor" />
                {activeSession ? 'Sessão de treino já em curso' : 'Iniciar Treino com esta Rotina'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL PARA ELIMINAR ROTINA (Ponto 28 / 42) */}
      {routineToDelete && (
        <div className="modal-overlay select-none">
          <div className="modal-content max-w-sm w-full space-y-5 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40 shadow-lg shadow-rose-500/15">
              <Trash2 size={28} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black text-white text-lg">Eliminar "{routineToDelete.name}"?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Esta ação remove apenas o modelo da rotina. As sessões antigas no seu histórico nunca serão afetadas.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRoutineToDelete(null)}
                className="btn-secondary flex-1 text-xs py-3 font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold rounded-full text-xs py-3 shadow-lg shadow-rose-500/30 transition cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <RoutineEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        routineToEdit={routineToEdit}
        onSaved={loadRoutines}
      />
    </div>
  );
};
