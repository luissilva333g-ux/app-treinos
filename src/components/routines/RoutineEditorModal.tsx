import React, { useState, useEffect } from 'react';
import type { RoutineWithExercises, Exercise } from '../../types';
import { DB } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { ExerciseSelectorModal } from '../workout/ExerciseSelectorModal';
import { Plus, X, Trash2, ArrowUp, ArrowDown, ListOrdered, Check } from 'lucide-react';

interface RoutineEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineToEdit: RoutineWithExercises | null; // null = Nova Rotina
  onSaved: () => void;
}

export const RoutineEditorModal: React.FC<RoutineEditorModalProps> = ({
  isOpen,
  onClose,
  routineToEdit,
  onSaved
}) => {
  const { activeUserId } = useAuth();
  const [name, setName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (routineToEdit) {
        setName(routineToEdit.name);
        setSelectedExercises(
          routineToEdit.exercises
            .sort((a, b) => a.position - b.position)
            .map(re => re.exercise)
        );
      } else {
        setName('');
        setSelectedExercises([]);
      }
    }
  }, [isOpen, routineToEdit]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUserId) return;
    if (!name.trim()) return;

    setLoading(true);
    const exIds = selectedExercises.map(e => e.id);

    if (routineToEdit) {
      await DB.updateRoutine(routineToEdit.id, name, exIds);
    } else {
      await DB.createRoutine(activeUserId, name, exIds);
    }

    setLoading(false);
    onSaved();
    onClose();
  };

  const handleRemoveExercise = (indexToRemove: number) => {
    setSelectedExercises(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === selectedExercises.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newArr = [...selectedExercises];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    setSelectedExercises(newArr);
  };

  return (
    <div className="modal-overlay select-none">
      <div className="modal-content max-w-md w-full animate-fade-in space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ListOrdered size={22} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">
              {routineToEdit ? 'Editar Rotina' : 'Nova Rotina'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-zinc-400 flex items-center justify-center hover:bg-white/20 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 block">
              Nome da Rotina
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Peito e Tríceps"
              className="apple-input text-sm py-3 font-semibold"
              required
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Exercícios ({selectedExercises.length})
              </label>
              <button
                type="button"
                onClick={() => setIsSelectorOpen(true)}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
              >
                <Plus size={14} /> + Adicionar
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {selectedExercises.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center text-zinc-400 text-xs">
                  A rotina não tem exercícios selecionados. Clique em "+ Adicionar" acima.
                </div>
              ) : (
                selectedExercises.map((ex, idx) => (
                  <div
                    key={`${ex.id}-${idx}`}
                    className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white text-sm truncate">
                        {ex.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveExercise(idx, 'up')}
                        disabled={idx === 0}
                        className={`w-6 h-6 rounded flex items-center justify-center ${
                          idx === 0 ? 'text-zinc-700' : 'text-zinc-400 bg-white/5'
                        }`}
                      >
                        <ArrowUp size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveExercise(idx, 'down')}
                        disabled={idx === selectedExercises.length - 1}
                        className={`w-6 h-6 rounded flex items-center justify-center ${
                          idx === selectedExercises.length - 1 ? 'text-zinc-700' : 'text-zinc-400 bg-white/5'
                        }`}
                      >
                        <ArrowDown size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(idx)}
                        className="w-6 h-6 rounded text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 text-xs py-3 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary flex-1 text-xs py-3 font-bold shadow-lg"
            >
              <Check size={16} /> {routineToEdit ? 'Guardar Rotina' : 'Criar Rotina'}
            </button>
          </div>
        </form>

        <ExerciseSelectorModal
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          onSelectExercise={ex => {
            setSelectedExercises(prev => [...prev, ex]);
          }}
        />
      </div>
    </div>
  );
};
