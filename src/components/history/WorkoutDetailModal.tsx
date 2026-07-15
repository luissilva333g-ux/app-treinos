import React, { useState, useEffect } from 'react';
import type { WorkoutSession, WorkoutExerciseWithSets } from '../../types';
import { DB } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { X, Clock, CheckCircle2 } from 'lucide-react';

interface WorkoutDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: WorkoutSession | null;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  isOpen,
  onClose,
  session
}) => {
  const { activeUserId } = useAuth();
  const [exercises, setExercises] = useState<WorkoutExerciseWithSets[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && session && activeUserId) {
      const loadDetail = async () => {
        setLoading(true);
        const detail = await DB.getSessionDetail(session.id, activeUserId);
        setExercises(detail.exercises);
        setLoading(false);
      };
      loadDetail();
    }
  }, [isOpen, session, activeUserId]);

  if (!isOpen || !session) return null;

  const dateFormatted = new Date(session.started_at).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const timeStart = new Date(session.started_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  const timeEnd = session.ended_at
    ? new Date(session.ended_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const durSec = session.ended_at
    ? Math.max(1, Math.floor((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000))
    : 0;
  const durMin = Math.floor(durSec / 60);
  const durHrs = Math.floor(durMin / 60);
  const durLabel = durHrs > 0 ? `${durHrs}h ${durMin % 60}min` : `${Math.max(1, durMin)}min`;

  return (
    <div className="modal-overlay select-none">
      <div className="modal-content max-w-md w-full animate-fade-in space-y-4">
        {/* Header Detalhe */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10 gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Treino Concluído
            </div>
            <h2 className="text-xl font-extrabold text-white mt-0.5">
              Sessão de {dateFormatted}
            </h2>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
              <span className="flex items-center gap-1"><Clock size={12} /> {timeStart} - {timeEnd} ({durLabel})</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-zinc-400 flex items-center justify-center hover:bg-white/20 transition shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Resumo Rápido */}
        <div className="glass-card p-3 bg-black/50 border-white/10 flex items-center justify-around text-center">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Duração</div>
            <div className="text-sm font-mono font-bold text-emerald-400">{durLabel}</div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Exercícios</div>
            <div className="text-sm font-bold text-white">{exercises.length}</div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Séries Realizadas</div>
            <div className="text-sm font-bold text-white">
              {exercises.reduce((acc, we) => acc + we.sets.filter(s => s.is_completed).length, 0)}
            </div>
          </div>
        </div>

        {/* Lista de Exercícios e Séries Efetivamente Realizadas (Ponto 29.2) */}
        <div className="max-h-72 overflow-y-auto space-y-3 pr-1 pt-1">
          {loading ? (
            <div className="text-center py-10 text-xs text-zinc-500">
              A carregar detalhes da sessão...
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 text-xs">
              Nenhuma série foi registada nesta sessão.
            </div>
          ) : (
            exercises.map((we, idx) => {
              const completedSets = we.sets.filter(s => s.is_completed);
              if (completedSets.length === 0) return null;

              return (
                <div key={we.id} className="glass-card p-3.5 space-y-2 bg-black/40 border-white/10">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-white/5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-extrabold text-white text-base truncate">
                      {we.exercise.name}
                    </h3>
                  </div>

                  <div className="space-y-1 pl-7">
                    {completedSets.map((set, setIdx) => (
                      <div key={set.id} className="flex items-center justify-between font-mono text-xs text-zinc-300">
                        <span>Série {setIdx + 1}</span>
                        <span className="font-bold text-white bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                          {set.weight ?? 0} kg × {set.reps ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button onClick={onClose} className="btn-secondary w-full text-xs py-2.5 mt-2 font-bold">
          Fechar Detalhes
        </button>
      </div>
    </div>
  );
};
