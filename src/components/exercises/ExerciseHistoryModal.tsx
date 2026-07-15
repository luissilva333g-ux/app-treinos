import React, { useState, useEffect, useCallback } from 'react';
import type { Exercise, WorkoutSet } from '../../types';
import { DB } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { X, Trophy, Dumbbell } from 'lucide-react';

interface ExerciseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}

export const ExerciseHistoryModal: React.FC<ExerciseHistoryModalProps> = ({
  isOpen,
  onClose,
  exercise
}) => {
  const { activeUserId, activeProfile } = useAuth();
  const [history, setHistory] = useState<{ date: string; sessionId: string; sets: WorkoutSet[] }[]>([]);
  const [bestSummary, setBestSummary] = useState<string>('Sem histórico');
  const [loading, setLoading] = useState<boolean>(true);

  const loadExerciseHistory = useCallback(async () => {
    if (!exercise || !activeUserId) return;
    setLoading(true);
    const [histData, bestData] = await Promise.all([
      DB.getExercisePersonalHistory(activeUserId, exercise.id),
      DB.getExerciseBestHistory(activeUserId, exercise.id)
    ]);
    setHistory(histData);
    setBestSummary(bestData.summary);
    setLoading(false);
  }, [exercise, activeUserId]);

  useEffect(() => {
    if (isOpen && exercise) {
      loadExerciseHistory();
    }
  }, [isOpen, exercise, loadExerciseHistory]);

  if (!isOpen || !exercise) return null;

  return (
    <div className="modal-overlay select-none">
      <div className="modal-content max-w-md w-full animate-fade-in space-y-4">
        {/* Header do Modal */}
        <div className="flex items-start justify-between pb-2 border-b border-white/10 gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <Dumbbell size={12} /> O meu histórico pessoal
            </div>
            <h2 className="text-xl font-extrabold text-white mt-0.5">
              {exercise.name}
            </h2>
            <p className="text-xs text-zinc-400">
              {activeProfile?.name} • {exercise.muscle_group || 'Exercício partilhado'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-zinc-400 flex items-center justify-center hover:bg-white/20 transition shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Card do Melhor Desempenho (Ponto 12) */}
        <div className="glass-card p-4 bg-gradient-to-r from-amber-950/40 via-zinc-900/80 to-zinc-950 border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Trophy size={20} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Melhor Desempenho
              </div>
              <div className="text-xs text-zinc-300">
                Regra: maior peso e maior número de repetições
              </div>
            </div>
          </div>
          <div className="font-mono text-lg font-extrabold text-white bg-black/50 px-3 py-1 rounded-xl border border-white/10">
            {bestSummary}
          </div>
        </div>

        {/* Lista Cronológica do Histórico Pessoal (Ponto 30) */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Sessões Concluídas ({history.length})
          </h3>

          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
            {loading ? (
              <div className="text-center py-10 text-xs text-zinc-500">
                A carregar histórico pessoal...
              </div>
            ) : history.length === 0 ? (
              <div className="glass-card p-6 text-center text-zinc-500 text-xs">
                Ainda não tem séries concluídas para este exercício.
              </div>
            ) : (
              history.map((item, idx) => {
                const dateFormatted = new Date(item.date).toLocaleDateString('pt-PT', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });

                return (
                  <div key={`${item.sessionId}-${idx}`} className="glass-card p-3.5 space-y-2 bg-black/40 border-white/10">
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-white/5 font-semibold text-zinc-300">
                      <span className="font-mono text-blue-400">{dateFormatted}</span>
                      <span className="text-[11px] text-zinc-500">{item.sets.length} séries ✓</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                      {item.sets.map((set, setIdx) => (
                        <div
                          key={set.id || setIdx}
                          className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 font-mono text-xs text-center font-bold text-white flex items-center justify-center gap-1"
                        >
                          <span className="text-zinc-500 text-[10px]">#{setIdx + 1}:</span>
                          <span>{set.weight ?? 0} kg × {set.reps ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <button onClick={onClose} className="btn-secondary w-full text-xs py-2.5 mt-2 font-bold">
          Fechar Histórico
        </button>
      </div>
    </div>
  );
};
