import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import type { TabType } from '../../types';
import { ExerciseSelectorModal } from './ExerciseSelectorModal';
import { FinishWorkoutModal } from './FinishWorkoutModal';
import { Plus, Check, Trash2, ArrowUp, ArrowDown, Dumbbell, Trophy } from 'lucide-react';

interface ActiveWorkoutPageProps {
  setActiveTab: (tab: TabType) => void;
}

export const ActiveWorkoutPage: React.FC<ActiveWorkoutPageProps> = ({ setActiveTab }) => {
  const {
    activeSession,
    workoutExercises,
    formattedDuration,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    moveExerciseOrder,
    addSet,
    updateSet,
    toggleSetCompleted,
    removeSet
  } = useWorkout();

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [exerciseToRemove, setExerciseToRemove] = useState<string | null>(null);

  if (!activeSession) {
    return (
      <div className="p-6 text-center space-y-6 pt-20 animate-fade-in">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-white/10 text-zinc-500">
          <Dumbbell size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Nenhum treino em curso</h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Inicie um treino livre a partir do Início ou selecione uma rotina predefinida.
          </p>
        </div>
        <button onClick={() => setActiveTab('home')} className="btn-primary text-sm">
          Ir para o Início
        </button>
      </div>
    );
  }

  const handleConfirmRemoveExercise = async () => {
    if (exerciseToRemove) {
      await removeExerciseFromWorkout(exerciseToRemove);
      setExerciseToRemove(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-32 animate-fade-in select-none">
      {/* 1. TOPO: TREINO EM CURSO & DURAÇÃO (Ponto 10) */}
      <div className="glass-card p-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-black border-white/10 flex items-center justify-between sticky top-14 z-40 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
              Treino em Curso
            </div>
            <div className="text-xs font-semibold text-zinc-300 mt-0.5">
              {workoutExercises.length} {workoutExercises.length === 1 ? 'exercício' : 'exercícios'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-mono text-xl font-extrabold text-white bg-black/60 px-3.5 py-1.5 rounded-xl border border-white/15 tracking-wider shadow-inner">
            {formattedDuration}
          </div>

          <button
            onClick={() => setIsFinishModalOpen(true)}
            className="btn-success text-xs py-2.5 px-4 font-extrabold shadow-lg shrink-0"
          >
            Terminar
          </button>
        </div>
      </div>

      {/* 2. LISTA DE EXERCÍCIOS E SÉRIES (Ponto 11 a 19) */}
      {workoutExercises.length === 0 ? (
        <div className="glass-card p-8 text-center space-y-4 border-dashed border-white/15">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <Plus size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">Sessão iniciada</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Adicione agora o seu primeiro exercício da biblioteca partilhada para começar a registar séries.
            </p>
          </div>
          <button
            onClick={() => setIsSelectorOpen(true)}
            className="btn-primary text-xs py-3 px-5 font-bold"
          >
            + Adicionar Exercício
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {workoutExercises.map((we, index) => (
            <div key={we.id} className="glass-card p-4 space-y-3.5 border-[rgba(255,255,255,0.08)] bg-[rgba(20,22,32,0.85)] relative">
              {/* Header do Exercício */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/15 w-6 h-6 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h3 className="font-extrabold text-white text-lg truncate">
                      {we.exercise.name}
                    </h3>
                  </div>

                  {/* Melhor Desempenho Histórico (Ponto 12) */}
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-1 pl-8">
                    <Trophy size={13} className="shrink-0" />
                    <span>Melhor desempenho anterior: <strong>{we.bestHistorySummary || 'Sem histórico'}</strong></span>
                  </div>
                </div>

                {/* Ações de Reordenação e Remoção (Ponto 18 e 19) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveExerciseOrder(we.id, 'up')}
                    disabled={index === 0}
                    title="Mover para cima"
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 bg-white/5 active:bg-white/15'
                    }`}
                  >
                    <ArrowUp size={15} />
                  </button>

                  <button
                    onClick={() => moveExerciseOrder(we.id, 'down')}
                    disabled={index === workoutExercises.length - 1}
                    title="Mover para baixo"
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      index === workoutExercises.length - 1 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 bg-white/5 active:bg-white/15'
                    }`}
                  >
                    <ArrowDown size={15} />
                  </button>

                  <button
                    onClick={() => setExerciseToRemove(we.id)}
                    title="Remover exercício"
                    className="w-7 h-7 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 flex items-center justify-center ml-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Tabela de Séries Mobile First (Ponto 11) */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                  <div className="col-span-2 text-center">Série</div>
                  <div className="col-span-4 text-center">Peso (kg)</div>
                  <div className="col-span-3 text-center">Reps</div>
                  <div className="col-span-3 text-right pr-1">Concluir</div>
                </div>

                {we.sets.map((set, setIdx) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition-all ${
                      set.is_completed
                        ? 'bg-emerald-950/30 border border-emerald-500/30'
                        : 'bg-black/40 border border-white/5'
                    }`}
                  >
                    {/* Número da Série + Botão para remover série individual (Ponto 16) */}
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <span className="font-mono text-sm font-bold text-zinc-300 w-5 text-center">
                        {setIdx + 1}
                      </span>
                      {we.sets.length > 1 && (
                        <button
                          onClick={() => removeSet(set.id, we.id)}
                          title="Eliminar série"
                          className="text-zinc-600 hover:text-rose-400 p-0.5"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Input Peso */}
                    <div className="col-span-4 flex justify-center">
                      <input
                        type="number"
                        step="any"
                        inputMode="decimal"
                        value={set.weight !== null ? set.weight : ''}
                        onChange={e => {
                          const val = e.target.value === '' ? null : parseFloat(e.target.value);
                          updateSet(set.id, 'weight', val);
                        }}
                        placeholder="0"
                        className="set-number-input font-mono"
                      />
                    </div>

                    {/* Input Reps */}
                    <div className="col-span-3 flex justify-center">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={set.reps !== null ? set.reps : ''}
                        onChange={e => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                          updateSet(set.id, 'reps', val);
                        }}
                        placeholder="0"
                        className="set-number-input font-mono"
                      />
                    </div>

                    {/* Botão de Conclusão ✓ (Ponto 15) */}
                    <div className="col-span-3 flex justify-end">
                      <button
                        onClick={() => toggleSetCompleted(set.id)}
                        className={`set-check-btn ${set.is_completed ? 'completed' : ''}`}
                      >
                        <Check size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão + Adicionar Série (Ponto 14) */}
              <button
                onClick={() => addSet(we.id)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 text-xs font-bold text-blue-400 flex items-center justify-center gap-1.5 transition"
              >
                <Plus size={16} /> Adicionar série
              </button>
            </div>
          ))}

          {/* Botão Principal + Adicionar Exercício (Ponto 17) */}
          <button
            onClick={() => setIsSelectorOpen(true)}
            className="btn-secondary w-full py-3.5 border-dashed border-blue-500/40 text-blue-400 font-bold"
          >
            <Plus size={20} /> Adicionar exercício ao treino
          </button>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO PARA REMOVER EXERCÍCIO DA SESSÃO (Ponto 18) */}
      {exerciseToRemove && (
        <div className="modal-overlay select-none">
          <div className="modal-content max-w-sm w-full space-y-4 animate-fade-in text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <Trash2 size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">Remover este exercício do treino?</h3>
              <p className="text-xs text-zinc-400">
                O exercício e as séries desta sessão serão removidos. O histórico anterior não será alterado.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setExerciseToRemove(null)}
                className="btn-secondary flex-1 text-xs py-2.5"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRemoveExercise}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full text-xs py-2.5 shadow-lg"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA SELECIONAR OU CRIAR NOVO EXERCÍCIO */}
      <ExerciseSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelectExercise={async (ex) => {
          await addExerciseToWorkout(ex.id);
        }}
      />

      {/* MODAL PARA TERMINAR TREINO */}
      <FinishWorkoutModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};
