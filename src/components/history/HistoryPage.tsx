import React, { useState, useEffect, useCallback } from 'react';
import type { WorkoutSession } from '../../types';
import { DB } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { WorkoutDetailModal } from './WorkoutDetailModal';
import { History, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { activeUserId, activeProfile } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);

  const loadHistory = useCallback(async () => {
    if (!activeUserId) return;
    setLoading(true);
    const list = await DB.getCompletedSessions(activeUserId);
    setSessions(list);
    setLoading(false);
  }, [activeUserId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="p-6 space-y-6 pb-32 animate-fade-in select-none">
      {/* Header (Ponto 29.1) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History size={26} className="text-emerald-400" />
            <span>Histórico de Treinos</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Sessões concluídas de {activeProfile?.name} • Ordem cronológica
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-zinc-500 text-xs">
          A carregar histórico...
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-card p-10 text-center space-y-4 border-dashed border-white/15">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <Calendar size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">Ainda não terminou treinos</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              As suas sessões concluídas aparecerão aqui ordenadas da mais recente para a mais antiga.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => {
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
                onClick={() => setSelectedSession(session)}
                className="glass-card p-4.5 flex items-center justify-between gap-3 border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] cursor-pointer active:scale-98 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/30 shadow-inner">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-white text-base truncate">
                        {session.source_routine_id ? 'Treino com Rotina' : 'Sessão Livre'}
                      </h3>
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Concluído
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {dateStr}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <div className="font-mono text-sm font-extrabold text-emerald-400">
                      {durLabel}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-medium">
                      Ver detalhes
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-500" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE DETALHE DE TREINO (Ponto 29.2) */}
      <WorkoutDetailModal
        isOpen={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
      />
    </div>
  );
};
