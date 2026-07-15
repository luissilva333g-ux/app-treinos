export interface Profile {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at?: string;
}

export interface Exercise {
  id: string;
  name: string;
  created_by: string | null;
  is_active: boolean;
  description?: string;
  muscle_group?: string;
  equipment?: string;
  created_at: string;
  updated_at?: string;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at?: string;
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  position: number;
  created_at: string;
}

export interface RoutineWithExercises extends Routine {
  exercises: {
    routineExerciseId: string;
    exercise: Exercise;
    position: number;
  }[];
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  source_routine_id: string | null;
  status: 'active' | 'completed' | 'discarded';
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at?: string;
}

export interface WorkoutExercise {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  position: number;
  created_at: string;
}

export interface WorkoutSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
}

export interface WorkoutExerciseWithSets {
  id: string; // workout_exercise.id
  workout_session_id: string;
  exercise_id: string;
  position: number;
  exercise: Exercise;
  sets: WorkoutSet[];
  bestHistorySummary?: string; // e.g. "80 × 10" or "Sem histórico"
}

export type TabType = 'home' | 'routines' | 'exercises' | 'history' | 'profile' | 'active_workout';
