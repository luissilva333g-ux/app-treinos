import React, { useState, useEffect } from 'react';
import type { Exercise } from '../../types';
import { DB } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, X, AlertCircle, Dumbbell } from 'lucide-react';

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export const ExerciseSelectorModal: React.FC<ExerciseSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise
}) => {
  const { currentUser } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadExercises = async () => {
    setLoading(true);
    const list = await DB.getExercises();
    setExercises(list);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadExercises();
      setSearchQuery('');
      setIsCreating(false);
      setNewExerciseName('');
      setCreateError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtragem ao vivo por pesquisa (Ponto 6.5)
  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;
    setCreateError(null);

    const res = await DB.createExercise(newExerciseName, currentUser?.id || 'a1111111-1111-1111-1111-111111111111');
    if (res.error || !res.exercise) {
      setCreateError(res.error || 'Falha ao criar o exercício.');
    } else {
      // Ponto 6.3 e 17: ao criar novo exercício na biblioteca global, é adicionado imediatamente à sessão / rotina!
      onSelectExercise(res.exercise);
      onClose();
    }
  };

  return (
    <div className="modal-overlay select-none">
      <div className="modal-content max-w-md w-full animate-fade-in">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Dumbbell size={20} className="text-blue-400" />
              <span>Biblioteca Global</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Selecione ou crie um exercício partilhado
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-zinc-400 flex items-center justify-center hover:bg-white/20 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário de Criação (se aberto) */}
        {isCreating ? (
          <form onSubmit={handleCreateNew} className="glass-card p-4 space-y-3 border-blue-500/40 bg-blue-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                + Criar Exercício Global
              </span>
              <button
                type="button"
                onClick={() => { setIsCreating(false); setCreateError(null); }}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>

            {createError && (
              <div className="bg-red-500/20 border border-red-500/40 p-2 rounded-lg text-red-300 text-xs font-medium flex items-center gap-1.5 animate-fade-in">
                <AlertCircle size={15} className="shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div>
              <input
                type="text"
                value={newExerciseName}
                onChange={e => setNewExerciseName(e.target.value)}
                placeholder="Ex: Supino inclinado na máquina"
                className="apple-input text-sm py-2.5"
                autoFocus
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full text-sm py-2.5 font-bold">
              Criar e Adicionar
            </button>
          </form>
        ) : (
          <div className="flex justify-between items-center">
            {/* Input de Pesquisa Rápida */}
            <div className="relative flex-1 mr-2">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Pesquisar ex: Supino..."
                className="apple-input pl-10 text-sm py-2.5"
              />
            </div>

            {/* Botão para Criar Exercício */}
            <button
              onClick={() => {
                setIsCreating(true);
                setNewExerciseName(searchQuery.trim());
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-lg shrink-0 transition"
            >
              <Plus size={16} /> Criar
            </button>
          </div>
        )}

        {/* Lista de Exercícios Disponíveis */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1 pt-1">
          {loading ? (
            <div className="text-center py-10 text-xs text-zinc-500">
              A carregar biblioteca global...
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs space-y-3">
              <p>Nenhum exercício encontrado com "{searchQuery}".</p>
              <button
                onClick={() => {
                  setIsCreating(true);
                  setNewExerciseName(searchQuery.trim());
                }}
                className="btn-secondary text-xs py-2 px-4"
              >
                + Criar "{searchQuery || 'Novo Exercício'}"
              </button>
            </div>
          ) : (
            filteredExercises.map(exercise => (
              <div
                key={exercise.id}
                onClick={() => {
                  onSelectExercise(exercise);
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 active:scale-98 transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    {exercise.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {exercise.muscle_group ? `${exercise.muscle_group} • ` : ''}
                    {exercise.equipment || 'Partilhado na Biblioteca'}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  <Plus size={16} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
