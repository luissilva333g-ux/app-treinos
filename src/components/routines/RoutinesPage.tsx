import React, { useState, useEffect, useCallback } from 'react';
import type { RoutineWithExercises, TabType } from '../../types';
import { DB } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { RoutineEditorModal } from './RoutineEditorModal';
import { Plus, ListOrdered, Play, Edit3, Trash2, Dumbbell } from 'lucide-react';

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
    <div className="p-6 space-y-6 pb-32 animate-fade-in select-none">
      {/* Header com botão de + Nova rotina (Ponto 25) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ListOrdered size={26} className="text-blue-400" />
            <span>As Minhas Rotinas</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Modelos de treino personalizados para acesso rápido
          </p>
        </div>

        <button
          onClick={() => {
            setRoutineToEdit(null);
            setIsEditorOpen(true);
          }}
          className="btn-primary text-xs py-2.5 px-4 font-bold shadow-lg shrink-0"
        >
          <Plus size={16} /> Nova Rotina
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-zinc-500 text-xs">
          A carregar rotinas...
        </div>
      ) : routines.length === 0 ? (
        <div className="glass-card p-10 text-center space-y-4 border-dashed border-white/15">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <ListOrdered size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">Ainda não existem rotinas</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Crie a sua primeira rotina selecionando exercícios da biblioteca para iniciar treinos em segundos.
            </p>
          </div>
          <button
            onClick={() => {
              setRoutineToEdit(null);
              setIsEditorOpen(true);
            }}
            className="btn-primary text-xs py-3 px-6 font-bold"
          >
            + Criar a minha primeira rotina
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {routines.map(routine => (
            <div
              key={routine.id}
              className="glass-card p-5 space-y-4 border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-white text-lg truncate">
                    {routine.name}
                  </h3>
                  <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
                    <Dumbbell size={14} className="text-blue-400 shrink-0" />
                    <span>
                      {routine.exercises.length} {routine.exercises.length === 1 ? 'exercício' : 'exercícios'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setRoutineToEdit(routine);
                      setIsEditorOpen(true);
                    }}
                    title="Editar rotina"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 transition"
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    onClick={() => setRoutineToDelete(routine)}
                    title="Eliminar rotina"
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Lista dos primeiros exercícios na rotina */}
              <div className="bg-black/40 rounded-2xl p-3.5 space-y-1.5 border border-white/5">
                {routine.exercises.length === 0 ? (
                  <span className="text-xs text-zinc-500 italic">Sem exercícios adicionados</span>
                ) : (
                  routine.exercises
                    .sort((a, b) => a.position - b.position)
                    .slice(0, 4)
                    .map((re, idx) => (
                      <div key={re.routineExerciseId} className="flex items-center gap-2 text-xs text-zinc-300">
                        <span className="font-mono font-bold text-zinc-500 w-4">{idx + 1}.</span>
                        <span className="font-medium truncate">{re.exercise.name}</span>
                      </div>
                    ))
                )}
                {routine.exercises.length > 4 && (
                  <div className="text-[11px] font-semibold text-blue-400 pl-6 pt-0.5">
                    + {routine.exercises.length - 4} mais exercícios
                  </div>
                )}
              </div>

              {/* Botão de Iniciar Treino (Ponto 9) */}
              <button
                onClick={() => handleStartWorkout(routine.id)}
                disabled={Boolean(activeSession)}
                className={`w-full py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition ${
                  activeSession
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                    : 'btn-primary'
                }`}
              >
                <Play size={16} fill="currentColor" />
                {activeSession ? 'Treino já em curso' : 'Iniciar Treino'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL PARA ELIMINAR ROTINA (Ponto 28 / 42) */}
      {routineToDelete && (
        <div className="modal-overlay select-none">
          <div className="modal-content max-w-sm w-full space-y-4 animate-fade-in text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <Trash2 size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">Eliminar "{routineToDelete.name}"?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Esta ação remove apenas o modelo da rotina. As sessões antigas no seu histórico nunca serão afetadas.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRoutineToDelete(null)}
                className="btn-secondary flex-1 text-xs py-2.5"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full text-xs py-2.5 shadow-lg"
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
