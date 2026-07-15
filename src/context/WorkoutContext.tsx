import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { WorkoutSession, WorkoutExerciseWithSets } from '../types';
import { DB } from '../lib/db';
import { useAuth } from './AuthContext';

interface WorkoutContextType {
  activeSession: WorkoutSession | null;
  workoutExercises: WorkoutExerciseWithSets[];
  elapsedSeconds: number;
  formattedDuration: string;
  savingStatus: 'idle' | 'saving' | 'saved' | 'error';
  isLoadingWorkout: boolean;
  
  // Ações
  startEmptyWorkout: () => Promise<void>;
  startRoutineWorkout: (routineId: string) => Promise<void>;
  addExerciseToWorkout: (exerciseId: string) => Promise<void>;
  removeExerciseFromWorkout: (workoutExerciseId: string) => Promise<void>;
  moveExerciseOrder: (workoutExerciseId: string, direction: 'up' | 'down') => Promise<void>;
  addSet: (workoutExerciseId: string) => Promise<void>;
  updateSet: (setId: string, field: 'weight' | 'reps', val: number | null) => Promise<void>;
  toggleSetCompleted: (setId: string) => Promise<void>;
  removeSet: (setId: string, workoutExerciseId: string) => Promise<void>;
  finishWorkout: (action: 'completed' | 'discarded', newRoutineName?: string) => Promise<{ success: boolean }>;
  refreshActiveWorkout: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeUserId } = useAuth();
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExerciseWithSets[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoadingWorkout, setIsLoadingWorkout] = useState<boolean>(true);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAutosaveIndicator = () => {
    setSavingStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSavingStatus('saved');
      setTimeout(() => setSavingStatus('idle'), 2500);
    }, 400);
  };

  const loadActiveWorkout = useCallback(async () => {
    if (!activeUserId) {
      setActiveSession(null);
      setWorkoutExercises([]);
      setIsLoadingWorkout(false);
      return;
    }

    setIsLoadingWorkout(true);
    const session = await DB.getActiveSession(activeUserId);
    if (session) {
      setActiveSession(session);
      const exercises = await DB.getWorkoutExercisesWithSets(session.id, activeUserId);
      setWorkoutExercises(exercises);
    } else {
      setActiveSession(null);
      setWorkoutExercises([]);
    }
    setIsLoadingWorkout(false);
  }, [activeUserId]);

  useEffect(() => {
    loadActiveWorkout();
  }, [loadActiveWorkout]);

  // Cronómetro real baseado na hora inicial do treino (Ponto 10 e 32.1)
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const startMs = new Date(activeSession.started_at).getTime();
    const updateTimer = () => {
      const nowMs = Date.now();
      const diffSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  // Formatação em HH:MM:SS
  const formatDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const startEmptyWorkout = async () => {
    if (!activeUserId) return;
    triggerAutosaveIndicator();
    const session = await DB.startEmptyWorkoutSession(activeUserId);
    setActiveSession(session);
    setWorkoutExercises([]);
  };

  const startRoutineWorkout = async (routineId: string) => {
    if (!activeUserId) return;
    triggerAutosaveIndicator();
    const session = await DB.startRoutineWorkoutSession(activeUserId, routineId);
    setActiveSession(session);
    const exercises = await DB.getWorkoutExercisesWithSets(session.id, activeUserId);
    setWorkoutExercises(exercises);
  };

  const addExerciseToWorkout = async (exerciseId: string) => {
    if (!activeSession || !activeUserId) return;
    triggerAutosaveIndicator();
    const newWE = await DB.addExerciseToWorkoutSession(activeSession.id, exerciseId, activeUserId, workoutExercises.length + 1);
    setWorkoutExercises(prev => [...prev, newWE]);
  };

  const removeExerciseFromWorkout = async (workoutExerciseId: string) => {
    if (!activeSession) return;
    triggerAutosaveIndicator();
    await DB.removeExerciseFromWorkoutSession(workoutExerciseId);
    setWorkoutExercises(prev => prev.filter(we => we.id !== workoutExerciseId));
  };

  const moveExerciseOrder = async (workoutExerciseId: string, direction: 'up' | 'down') => {
    if (!activeSession) return;
    const index = workoutExercises.findIndex(we => we.id === workoutExerciseId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === workoutExercises.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newArr = [...workoutExercises];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    // Atualizar positions locais
    const updated = newArr.map((we, idx) => ({ ...we, position: idx + 1 }));
    setWorkoutExercises(updated);

    triggerAutosaveIndicator();
    await DB.reorderWorkoutExercises(updated.map(we => ({ id: we.id, position: we.position })));
  };

  const addSet = async (workoutExerciseId: string) => {
    if (!activeSession) return;
    const targetWE = workoutExercises.find(we => we.id === workoutExerciseId);
    if (!targetWE) return;

    const lastSet = targetWE.sets.length > 0 ? targetWE.sets[targetWE.sets.length - 1] : null;
    const prevWeight = lastSet ? lastSet.weight : null;
    const prevReps = lastSet ? lastSet.reps : null;

    triggerAutosaveIndicator();
    const newSet = await DB.addSetToWorkoutExercise(workoutExerciseId, prevWeight, prevReps);
    setWorkoutExercises(prev => prev.map(we => {
      if (we.id === workoutExerciseId) {
        return { ...we, sets: [...we.sets, newSet] };
      }
      return we;
    }));
  };

  const updateSet = async (setId: string, field: 'weight' | 'reps', val: number | null) => {
    triggerAutosaveIndicator();
    setWorkoutExercises(prev => prev.map(we => ({
      ...we,
      sets: we.sets.map(s => s.id === setId ? { ...s, [field]: val } : s)
    })));
    await DB.updateSet(setId, { [field]: val });
  };

  const toggleSetCompleted = async (setId: string) => {
    triggerAutosaveIndicator();
    let newState = false;
    setWorkoutExercises(prev => prev.map(we => ({
      ...we,
      sets: we.sets.map(s => {
        if (s.id === setId) {
          newState = !s.is_completed;
          return { ...s, is_completed: newState };
        }
        return s;
      })
    })));
    await DB.updateSet(setId, { is_completed: newState });
  };

  const removeSet = async (setId: string, workoutExerciseId: string) => {
    triggerAutosaveIndicator();
    setWorkoutExercises(prev => prev.map(we => {
      if (we.id === workoutExerciseId) {
        const remaining = we.sets
          .filter(s => s.id !== setId)
          .map((s, idx) => ({ ...s, set_number: idx + 1 }));
        return { ...we, sets: remaining };
      }
      return we;
    }));
    await DB.removeSet(setId, workoutExerciseId);
  };

  const finishWorkout = async (action: 'completed' | 'discarded', newRoutineName?: string): Promise<{ success: boolean }> => {
    if (!activeSession || !activeUserId) return { success: false };

    // Se o utilizador pediu para criar rotina deste treino (Ponto 27)
    if (action === 'completed' && newRoutineName && newRoutineName.trim() !== '') {
      const exerciseIds = workoutExercises
        .filter(we => we.sets.some(s => s.is_completed)) // Apenas exercícios com pelo menos 1 série concluída
        .sort((a, b) => a.position - b.position)
        .map(we => we.exercise_id);

      if (exerciseIds.length > 0) {
        await DB.createRoutine(activeUserId, newRoutineName.trim(), exerciseIds);
      }
    }

    await DB.finishWorkoutSession(activeSession.id, action);
    setActiveSession(null);
    setWorkoutExercises([]);
    setElapsedSeconds(0);
    return { success: true };
  };

  return (
    <WorkoutContext.Provider
      value={{
        activeSession,
        workoutExercises,
        elapsedSeconds,
        formattedDuration: formatDuration(elapsedSeconds),
        savingStatus,
        isLoadingWorkout,
        startEmptyWorkout,
        startRoutineWorkout,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        moveExerciseOrder,
        addSet,
        updateSet,
        toggleSetCompleted,
        removeSet,
        finishWorkout,
        refreshActiveWorkout: loadActiveWorkout
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) throw new Error('useWorkout deve ser usado dentro de um WorkoutProvider');
  return context;
};
