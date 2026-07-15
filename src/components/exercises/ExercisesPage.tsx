import React, { useState, useEffect } from 'react';
import type { Exercise } from '../../types';
import { DB } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { ExerciseHistoryModal } from './ExerciseHistoryModal';
import { Search, Plus, Dumbbell, AlertCircle, Sparkles } from 'lucide-react';

export const ExercisesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedExerciseForHistory, setSelectedExerciseForHistory] = useState<Exercise | null>(null);

  const loadExercises = async () => {
    setLoading(true);
    const list = await DB.getExercises();
    setExercises(list);
    setLoading(false);
  };

  useEffect(() => {
    loadExercises();
  }, []);

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
      setIsCreating(false);
      setNewExerciseName('');
      loadExercises();
    }
  };

  return (
    <div className="p-6 space-y-6 pb-32 animate-fade-in select-none">
      {/* Header com informação sobre Biblioteca Global (Ponto 6.1) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Dumbbell size={26} className="text-blue-400" />
            <span>Biblioteca Global</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
            <Sparkles size={13} className="text-amber-400" />
            Exercícios partilhados entre todos os utilizadores
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setCreateError(null);
            setNewExerciseName(searchQuery.trim());
          }}
          className="btn-primary text-xs py-2.5 px-4 font-bold shadow-lg shrink-0"
        >
          <Plus size={16} /> Criar Exercício
        </button>
      </div>

      {/* Formulário de criação direta de exercício (Ponto 6.3 / 6.4) */}
      {isCreating && (
        <form onSubmit={handleCreateNew} className="glass-card p-5 space-y-3.5 border-blue-500/40 bg-blue-950/20 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              + Criar Novo Exercício Global
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
            <div className="bg-red-500/20 border border-red-500/40 p-2.5 rounded-xl text-red-300 text-xs font-medium flex items-center gap-1.5 animate-fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div>
            <input
              type="text"
              value={newExerciseName}
              onChange={e => setNewExerciseName(e.target.value)}
              placeholder="Ex: Supino inclinado na máquina"
              className="apple-input text-sm py-3"
              autoFocus
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full text-xs py-3 font-bold shadow-lg">
            Criar e Partilhar
          </button>
        </form>
      )}

      {/* Barra de Pesquisa ao vivo (Ponto 6.5) */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Pesquisar exercícios partilhados (ex: Supino)..."
          className="apple-input pl-11 py-3 text-sm"
        />
      </div>

      {/* Lista de Exercícios Globais */}
      {loading ? (
        <div className="text-center py-16 text-zinc-500 text-xs">
          A carregar exercícios globais...
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="glass-card p-10 text-center space-y-4 border-dashed border-white/15">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <Dumbbell size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">Nenhum exercício encontrado</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Não existe nenhum exercício com o nome "{searchQuery}". Crie para partilhar com todos os utilizadores.
            </p>
          </div>
          <button
            onClick={() => {
              setIsCreating(true);
              setNewExerciseName(searchQuery.trim());
            }}
            className="btn-primary text-xs py-3 px-6 font-bold"
          >
            + Criar "{searchQuery || 'Novo Exercício'}"
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredExercises.map(exercise => (
            <div
              key={exercise.id}
              onClick={() => setSelectedExerciseForHistory(exercise)}
              className="glass-card p-4 flex items-center justify-between gap-3 border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] cursor-pointer active:scale-98 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/15 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/20">
                  <Dumbbell size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-base truncate">
                    {exercise.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">
                    {exercise.muscle_group ? `${exercise.muscle_group} • ` : ''}
                    {exercise.equipment || 'Partilhado na Biblioteca'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                  O meu histórico →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE HISTÓRICO POR EXERCÍCIO (Ponto 30) */}
      <ExerciseHistoryModal
        isOpen={Boolean(selectedExerciseForHistory)}
        onClose={() => setSelectedExerciseForHistory(null)}
        exercise={selectedExerciseForHistory}
      />
    </div>
  );
};
