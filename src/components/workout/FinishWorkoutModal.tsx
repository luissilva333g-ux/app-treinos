import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import type { TabType } from '../../types';
import { Check, AlertTriangle, ArrowLeft, Bookmark, Dumbbell, Play } from 'lucide-react';

interface FinishWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: TabType) => void;
}

export const FinishWorkoutModal: React.FC<FinishWorkoutModalProps> = ({
  isOpen,
  onClose,
  setActiveTab
}) => {
  const { formattedDuration, workoutExercises, finishWorkout } = useWorkout();

  const [step, setStep] = useState<'summary' | 'discard_confirm' | 'routine_prompt'>('summary');
  const [newRoutineName, setNewRoutineName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Cálculos do Resumo (Ponto 22)
  const totalExercises = workoutExercises.length;
  const completedSetsCount = workoutExercises.reduce(
    (acc, we) => acc + we.sets.filter(s => s.is_completed).length,
    0
  );

  const handleConfirmSave = async (createRoutine: boolean) => {
    setLoading(true);
    await finishWorkout('completed', createRoutine ? newRoutineName : undefined);
    setLoading(false);
    onClose();
    setActiveTab('history');
  };

  const handleConfirmDiscard = async () => {
    setLoading(true);
    await finishWorkout('discarded');
    setLoading(false);
    onClose();
    setActiveTab('home');
  };

  return (
    <div className="modal-overlay select-none">
      <div className="modal-content max-w-sm w-full animate-fade-in">
        {step === 'summary' && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                <Dumbbell size={32} />
              </div>
              <h2 className="text-xl font-extrabold text-white">
                Terminar Treino?
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Verifique o resumo da sua sessão de hoje
              </p>
            </div>

            {/* Painel de Resumo (Ponto 22) */}
            <div className="glass-card p-4 space-y-3 bg-black/50 border-white/10">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-xs text-zinc-400 font-semibold uppercase">Duração</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{formattedDuration}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-xs text-zinc-400 font-semibold uppercase">Exercícios</span>
                <span className="text-sm font-bold text-white">{totalExercises}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400 font-semibold uppercase">Séries Concluídas</span>
                <span className="text-sm font-bold text-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  {completedSetsCount} séries
                </span>
              </div>
            </div>

            {completedSetsCount === 0 && (
              <div className="bg-amber-500/15 border border-amber-500/30 p-3 rounded-xl text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>Nenhuma série foi marcada com ✓. Se guardar agora, o treino não terá séries realizadas no registo.</span>
              </div>
            )}

            {/* Ações Principais (Ponto 22) */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => setStep('routine_prompt')}
                disabled={loading}
                className="btn-success w-full font-extrabold shadow-xl"
              >
                <Check size={20} /> Guardar Treino
              </button>

              <button
                onClick={onClose}
                disabled={loading}
                className="btn-secondary w-full text-sm py-3"
              >
                <Play size={16} /> Continuar Treino
              </button>

              <button
                onClick={() => setStep('discard_confirm')}
                disabled={loading}
                className="w-full py-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition"
              >
                Descartar Treino
              </button>
            </div>
          </div>
        )}

        {/* PONTO 27: PROMPT PARA CRIAR ROTINA DESTE TREINO */}
        {step === 'routine_prompt' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
                <Bookmark size={26} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Guardar como Rotina?
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Quer criar um modelo de rotina com os exercícios que realizou hoje para usar no futuro?
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Nome da Rotina
              </label>
              <input
                type="text"
                value={newRoutineName}
                onChange={e => setNewRoutineName(e.target.value)}
                placeholder="Ex: Treino A - Peito e Ombro"
                className="apple-input text-sm"
              />
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleConfirmSave(true)}
                disabled={loading || !newRoutineName.trim()}
                className="btn-primary w-full text-sm font-bold py-3"
              >
                Guardar Treino e Criar Rotina
              </button>

              <button
                onClick={() => handleConfirmSave(false)}
                disabled={loading}
                className="btn-secondary w-full text-sm py-3"
              >
                Apenas Guardar Treino
              </button>

              <button
                onClick={() => setStep('summary')}
                className="w-full text-xs text-zinc-400 py-1"
              >
                Voltar atrás
              </button>
            </div>
          </div>
        )}

        {/* PONTO 24: SEGUNDA CONFIRMAÇÃO PARA DESCARTAR */}
        {step === 'discard_confirm' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-500/30">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Tens a certeza?
              </h3>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed font-medium">
                Este treino e todas as alterações serão eliminados permanentemente e não entrarão no histórico.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleConfirmDiscard}
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-full text-sm shadow-xl transition"
              >
                Descartar Definitivamente
              </button>

              <button
                onClick={() => setStep('summary')}
                disabled={loading}
                className="btn-secondary w-full text-sm py-3"
              >
                <ArrowLeft size={16} /> Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
