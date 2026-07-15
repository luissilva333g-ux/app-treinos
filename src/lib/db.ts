import { supabase, isSupabaseConfigured } from './supabase';
import type { 
  Profile, 
  Exercise, 
  Routine, 
  RoutineExercise, 
  WorkoutSession, 
  WorkoutExercise, 
  WorkoutSet,
  RoutineWithExercises,
  WorkoutExerciseWithSets
} from '../types';

// ============================================================================
// DADOS SEMENTE PARA O MODO LOCAL (SE SUPABASE NÃO ESTIVER CONFIGURADO)
// ============================================================================
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Luís (Administrador)',
    username: 'Admin',
    role: 'admin',
    created_at: '2026-07-01T10:00:00Z'
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: 'Sofia Rodrigues',
    username: 'sofia',
    role: 'user',
    created_at: '2026-07-02T11:00:00Z'
  }
];

const INITIAL_EXERCISES: Exercise[] = [
  { id: 'e1000000-0000-0000-0000-000000000001', name: 'Supino com barra', created_by: 'a1111111-1111-1111-1111-111111111111', is_active: true, muscle_group: 'Peito', equipment: 'Barra', created_at: '2026-07-01T10:00:00Z' },
  { id: 'e1000000-0000-0000-0000-000000000002', name: 'Supino inclinado com halteres', created_by: 'a1111111-1111-1111-1111-111111111111', is_active: true, muscle_group: 'Peito', equipment: 'Halteres', created_at: '2026-07-01T10:00:00Z' },
  { id: 'e1000000-0000-0000-0000-000000000003', name: 'Crucifixo na máquina', created_by: 'a1111111-1111-1111-1111-111111111111', is_active: true, muscle_group: 'Peito', equipment: 'Máquina', created_at: '2026-07-01T10:00:00Z' },
  { id: 'e1000000-0000-0000-0000-000000000004', name: 'Agachamento livre com barra', created_by: 'a1111111-1111-1111-1111-111111111111', is_active: true, muscle_group: 'Pernas', equipment: 'Barra', created_at: '2026-07-01T10:00:00Z' },
  { id: 'e1000000-0000-0000-0000-000000000005', name: 'Leg Press 45º', created_by: 'a1111111-1111-1111-1111-111111111111', is_active: true, muscle_group: 'Pernas', equipment: 'Máquina', created_at: '2026-07-01T10:00:00Z' },
  { id: 'e1000000-0000-0000-0000-000000000006', name: 'Cadeira extensora', created_by: 'a1111111-1111-1111-1111-111111111111', is_active: true, muscle_group: 'Pernas', equipment: 'Máquina', created_at: '2026-07-01T10:00:00Z' },
  { id: 'e1000000-0000-0000-0000-000000000007', name: 'Puxada na frente com barra reta', created_by: 'a1111111-1111-1111-1111-111111111111', is_active: true, muscle_group: 'Costas', equipment: 'Polia', created_at: '2026-07-01T10:00:00Z' },
  { id: 'e1000000-0000-0000-0000-000000000008', name: 'Remada curvada com barra', created_by: 'a1111111-1111-1111-1111-111111111111', is_active: true, muscle_group: 'Costas', equipment: 'Barra', created_at: '2026-07-01T10:00:00Z' },
  { id: 'e1000000-0000-0000-0000-000000000009', name: 'Desenvolvimento militar com halteres', created_by: 'a1111111-1111-1111-1111-111111111111', is_active: true, muscle_group: 'Ombros', equipment: 'Halteres', created_at: '2026-07-01T10:00:00Z' },
  { id: 'e1000000-0000-0000-0000-000000000010', name: 'Elevação lateral com halteres', created_by: 'a1111111-1111-1111-1111-111111111111', is_active: true, muscle_group: 'Ombros', equipment: 'Halteres', created_at: '2026-07-01T10:00:00Z' },
  { id: 'e1000000-0000-0000-0000-000000000011', name: 'Rosca direta com barra W', created_by: 'a1111111-1111-1111-1111-111111111111', is_active: true, muscle_group: 'Bíceps', equipment: 'Barra', created_at: '2026-07-01T10:00:00Z' },
  { id: 'e1000000-0000-0000-0000-000000000012', name: 'Tríceps na polia com corda', created_by: 'a1111111-1111-1111-1111-111111111111', is_active: true, muscle_group: 'Tríceps', equipment: 'Polia', created_at: '2026-07-01T10:00:00Z' }
];

const INITIAL_ROUTINES: Routine[] = [
  { id: 'r1000000-0000-0000-0000-000000000001', user_id: 'a1111111-1111-1111-1111-111111111111', name: 'Peito e Tríceps', created_at: '2026-07-03T09:00:00Z' },
  { id: 'r1000000-0000-0000-0000-000000000002', user_id: 'a1111111-1111-1111-1111-111111111111', name: 'Costas e Bíceps', created_at: '2026-07-03T09:10:00Z' }
];

const INITIAL_ROUTINE_EXERCISES: RoutineExercise[] = [
  { id: 're100000-0000-0000-0000-000000000001', routine_id: 'r1000000-0000-0000-0000-000000000001', exercise_id: 'e1000000-0000-0000-0000-000000000001', position: 1, created_at: '2026-07-03T09:00:00Z' },
  { id: 're100000-0000-0000-0000-000000000002', routine_id: 'r1000000-0000-0000-0000-000000000001', exercise_id: 'e1000000-0000-0000-0000-000000000002', position: 2, created_at: '2026-07-03T09:00:00Z' },
  { id: 're100000-0000-0000-0000-000000000003', routine_id: 'r1000000-0000-0000-0000-000000000001', exercise_id: 'e1000000-0000-0000-0000-000000000003', position: 3, created_at: '2026-07-03T09:00:00Z' },
  { id: 're100000-0000-0000-0000-000000000004', routine_id: 'r1000000-0000-0000-0000-000000000001', exercise_id: 'e1000000-0000-0000-0000-000000000012', position: 4, created_at: '2026-07-03T09:00:00Z' },
  
  { id: 're100000-0000-0000-0000-000000000005', routine_id: 'r1000000-0000-0000-0000-000000000002', exercise_id: 'e1000000-0000-0000-0000-000000000007', position: 1, created_at: '2026-07-03T09:10:00Z' },
  { id: 're100000-0000-0000-0000-000000000006', routine_id: 'r1000000-0000-0000-0000-000000000002', exercise_id: 'e1000000-0000-0000-0000-000000000008', position: 2, created_at: '2026-07-03T09:10:00Z' },
  { id: 're100000-0000-0000-0000-000000000007', routine_id: 'r1000000-0000-0000-0000-000000000002', exercise_id: 'e1000000-0000-0000-0000-000000000011', position: 3, created_at: '2026-07-03T09:10:00Z' }
];

// Helper para gerir o localStorage localmente com persistência
class LocalStorageDB {
  private get<T>(key: string, initial: T): T {
    try {
      const item = localStorage.getItem(`app_treinos_${key}`);
      if (!item) {
        localStorage.setItem(`app_treinos_${key}`, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(item);
    } catch {
      return initial;
    }
  }

  private set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`app_treinos_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Falha ao guardar no localStorage:', e);
    }
  }

  get profiles(): Profile[] { return this.get('profiles', INITIAL_PROFILES); }
  set profiles(val: Profile[]) { this.set('profiles', val); }

  get exercises(): Exercise[] { return this.get('exercises', INITIAL_EXERCISES); }
  set exercises(val: Exercise[]) { this.set('exercises', val); }

  get routines(): Routine[] { return this.get('routines', INITIAL_ROUTINES); }
  set routines(val: Routine[]) { this.set('routines', val); }

  get routine_exercises(): RoutineExercise[] { return this.get('routine_exercises', INITIAL_ROUTINE_EXERCISES); }
  set routine_exercises(val: RoutineExercise[]) { this.set('routine_exercises', val); }

  get workout_sessions(): WorkoutSession[] { return this.get('workout_sessions', [] as WorkoutSession[]); }
  set workout_sessions(val: WorkoutSession[]) { this.set('workout_sessions', val); }

  get workout_exercises(): WorkoutExercise[] { return this.get('workout_exercises', [] as WorkoutExercise[]); }
  set workout_exercises(val: WorkoutExercise[]) { this.set('workout_exercises', val); }

  get workout_sets(): WorkoutSet[] { return this.get('workout_sets', [] as WorkoutSet[]); }
  set workout_sets(val: WorkoutSet[]) { this.set('workout_sets', val); }
}

const localDB = new LocalStorageDB();

// ============================================================================
// API DE ACESSO A DADOS (CAMADA ÚNICA SUPABASE OU LOCAL)
// ============================================================================

export const DB = {
  // --- UTILIZADORES / PERFIS ---
  async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').order('name');
      if (!error && data) return data as Profile[];
    }
    return localDB.profiles;
  },

  async getProfileById(id: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (data) return data as Profile;
    }
    return localDB.profiles.find(p => p.id === id) || null;
  },

  // --- BIBLIOTECA GLOBAL DE EXERCÍCIOS ---
  async getExercises(): Promise<Exercise[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('exercises').select('*').eq('is_active', true).order('name');
      if (!error && data) return data as Exercise[];
    }
    return localDB.exercises.filter(e => e.is_active).sort((a, b) => a.name.localeCompare(b.name));
  },

  async createExercise(name: string, createdBy: string): Promise<{ exercise: Exercise | null; error: string | null }> {
    const trimmedName = name.trim();
    if (!trimmedName) return { exercise: null, error: 'O nome do exercício é obrigatório.' };

    const existingExercises = await this.getExercises();
    const isDuplicate = existingExercises.some(
      e => e.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      return { exercise: null, error: 'Já existe um exercício com este nome.' };
    }

    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name: trimmedName,
      created_by: createdBy,
      is_active: true,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('exercises').insert([newExercise]).select().single();
      if (error) return { exercise: null, error: error.message };
      return { exercise: data as Exercise, error: null };
    }

    const all = localDB.exercises;
    all.push(newExercise);
    localDB.exercises = all;
    return { exercise: newExercise, error: null };
  },

  // --- ROTINAS ---
  async getRoutines(userId: string): Promise<RoutineWithExercises[]> {
    const allExercises = await this.getExercises();

    if (isSupabaseConfigured && supabase) {
      const { data: routines } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (routines) {
        const result: RoutineWithExercises[] = [];
        for (const r of routines) {
          const { data: reData } = await supabase
            .from('routine_exercises')
            .select('*')
            .eq('routine_id', r.id)
            .order('position', { ascending: true });

          const exercises = (reData || []).map(re => {
            const ex = allExercises.find(e => e.id === re.exercise_id);
            return {
              routineExerciseId: re.id,
              exercise: ex || { id: re.exercise_id, name: 'Exercício removido', created_by: null, is_active: false, created_at: '' },
              position: re.position
            };
          });

          result.push({ ...r, exercises });
        }
        return result;
      }
    }

    const userRoutines = localDB.routines.filter(r => r.user_id === userId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const routineEx = localDB.routine_exercises;

    return userRoutines.map(r => {
      const related = routineEx
        .filter(re => re.routine_id === r.id)
        .sort((a, b) => a.position - b.position)
        .map(re => {
          const ex = allExercises.find(e => e.id === re.exercise_id);
          return {
            routineExerciseId: re.id,
            exercise: ex || { id: re.exercise_id, name: 'Exercício removido', created_by: null, is_active: false, created_at: '' },
            position: re.position
          };
        });
      return { ...r, exercises: related };
    });
  },

  async createRoutine(userId: string, name: string, exerciseIds: string[]): Promise<RoutineWithExercises> {
    const routineId = crypto.randomUUID();
    const newRoutine: Routine = {
      id: routineId,
      user_id: userId,
      name: name.trim() || 'Nova Rotina',
      created_at: new Date().toISOString()
    };

    const routineExercises: RoutineExercise[] = exerciseIds.map((exId, index) => ({
      id: crypto.randomUUID(),
      routine_id: routineId,
      exercise_id: exId,
      position: index + 1,
      created_at: new Date().toISOString()
    }));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('routines').insert([newRoutine]);
      if (routineExercises.length > 0) {
        await supabase.from('routine_exercises').insert(routineExercises);
      }
    } else {
      localDB.routines = [...localDB.routines, newRoutine];
      localDB.routine_exercises = [...localDB.routine_exercises, ...routineExercises];
    }

    const routines = await this.getRoutines(userId);
    return routines.find(r => r.id === routineId)!;
  },

  async updateRoutine(routineId: string, name: string, exerciseIds: string[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('routines').update({ name: name.trim(), updated_at: new Date().toISOString() }).eq('id', routineId);
      await supabase.from('routine_exercises').delete().eq('routine_id', routineId);
      if (exerciseIds.length > 0) {
        const routineExercises = exerciseIds.map((exId, index) => ({
          id: crypto.randomUUID(),
          routine_id: routineId,
          exercise_id: exId,
          position: index + 1,
          created_at: new Date().toISOString()
        }));
        await supabase.from('routine_exercises').insert(routineExercises);
      }
    } else {
      localDB.routines = localDB.routines.map(r => r.id === routineId ? { ...r, name: name.trim(), updated_at: new Date().toISOString() } : r);
      const remainingRE = localDB.routine_exercises.filter(re => re.routine_id !== routineId);
      const newRE = exerciseIds.map((exId, index) => ({
        id: crypto.randomUUID(),
        routine_id: routineId,
        exercise_id: exId,
        position: index + 1,
        created_at: new Date().toISOString()
      }));
      localDB.routine_exercises = [...remainingRE, ...newRE];
    }
  },

  async deleteRoutine(routineId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('routines').delete().eq('id', routineId);
    } else {
      localDB.routines = localDB.routines.filter(r => r.id !== routineId);
      localDB.routine_exercises = localDB.routine_exercises.filter(re => re.routine_id !== routineId);
    }
  },

  // --- HISTÓRICO E MELHOR DESEMPENHO (REGRA OBJETIVA PONTO 12) ---
  async getExerciseBestHistory(userId: string, exerciseId: string): Promise<{
    summary: string;
    bestSessionId: string | null;
    bestWeight: number | null;
    bestReps: number | null;
  }> {
    const completedSessions = await this.getCompletedSessions(userId);
    const sessionIds = completedSessions.map(s => s.id);

    if (sessionIds.length === 0) {
      return { summary: 'Sem histórico', bestSessionId: null, bestWeight: null, bestReps: null };
    }

    let allSets: (WorkoutSet & { session_id: string })[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data: weData } = await supabase
        .from('workout_exercises')
        .select('id, workout_session_id')
        .eq('exercise_id', exerciseId)
        .in('workout_session_id', sessionIds);

      if (weData && weData.length > 0) {
        const weMap = new Map(weData.map(we => [we.id, we.workout_session_id]));
        const weIds = weData.map(we => we.id);

        const { data: setData } = await supabase
          .from('workout_sets')
          .select('*')
          .eq('is_completed', true)
          .in('workout_exercise_id', weIds);

        if (setData) {
          allSets = setData.map(s => ({
            ...s,
            session_id: weMap.get(s.workout_exercise_id)!
          }));
        }
      }
    } else {
      const weList = localDB.workout_exercises.filter(
        we => we.exercise_id === exerciseId && sessionIds.includes(we.workout_session_id)
      );
      const weMap = new Map(weList.map(we => [we.id, we.workout_session_id]));
      const weIds = weList.map(we => we.id);

      allSets = localDB.workout_sets
        .filter(s => s.is_completed && weIds.includes(s.workout_exercise_id))
        .map(s => ({
          ...s,
          session_id: weMap.get(s.workout_exercise_id)!
        }));
    }

    if (allSets.length === 0) {
      return { summary: 'Sem histórico', bestSessionId: null, bestWeight: null, bestReps: null };
    }

    allSets.sort((a, b) => {
      const wA = a.weight ?? -1;
      const wB = b.weight ?? -1;
      if (wB !== wA) return wB - wA;
      return (b.reps ?? -1) - (a.reps ?? -1);
    });

    const best = allSets[0];

    return {
      summary: `${best.weight ?? 0} × ${best.reps ?? 0}`,
      bestSessionId: best.session_id,
      bestWeight: best.weight,
      bestReps: best.reps
    };
  },

  async getExercisePredefinedSets(userId: string, exerciseId: string): Promise<Array<{ weight: number | null; reps: number | null }>> {
    const bestInfo = await this.getExerciseBestHistory(userId, exerciseId);
    if (!bestInfo.bestSessionId) {
      return [{ weight: null, reps: null }];
    }

    if (isSupabaseConfigured && supabase) {
      const { data: weData } = await supabase
        .from('workout_exercises')
        .select('id')
        .eq('workout_session_id', bestInfo.bestSessionId)
        .eq('exercise_id', exerciseId)
        .single();

      if (weData) {
        const { data: sets } = await supabase
          .from('workout_sets')
          .select('weight, reps')
          .eq('workout_exercise_id', weData.id)
          .eq('is_completed', true)
          .order('set_number', { ascending: true });

        if (sets && sets.length > 0) return sets;
      }
    } else {
      const we = localDB.workout_exercises.find(
        w => w.workout_session_id === bestInfo.bestSessionId && w.exercise_id === exerciseId
      );
      if (we) {
        const sets = localDB.workout_sets
          .filter(s => s.workout_exercise_id === we.id && s.is_completed)
          .sort((a, b) => a.set_number - b.set_number)
          .map(s => ({ weight: s.weight, reps: s.reps }));
        if (sets.length > 0) return sets;
      }
    }

    return [{ weight: bestInfo.bestWeight, reps: bestInfo.bestReps }];
  },

  async getActiveSession(userId: string): Promise<WorkoutSession | null> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();
      return data as WorkoutSession | null;
    }
    return localDB.workout_sessions.find(s => s.user_id === userId && s.status === 'active') || null;
  },

  async getWorkoutExercisesWithSets(sessionId: string, userId: string): Promise<WorkoutExerciseWithSets[]> {
    const allExercises = await this.getExercises();
    let weList: WorkoutExercise[] = [];
    let setList: WorkoutSet[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data: weData } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('workout_session_id', sessionId)
        .order('position', { ascending: true });

      weList = (weData || []) as WorkoutExercise[];
      if (weList.length > 0) {
        const weIds = weList.map(we => we.id);
        const { data: setData } = await supabase
          .from('workout_sets')
          .select('*')
          .in('workout_exercise_id', weIds)
          .order('set_number', { ascending: true });
        setList = (setData || []) as WorkoutSet[];
      }
    } else {
      weList = localDB.workout_exercises
        .filter(we => we.workout_session_id === sessionId)
        .sort((a, b) => a.position - b.position);
      const weIds = weList.map(we => we.id);
      setList = localDB.workout_sets
        .filter(s => weIds.includes(s.workout_exercise_id))
        .sort((a, b) => a.set_number - b.set_number);
    }

    const result: WorkoutExerciseWithSets[] = [];
    for (const we of weList) {
      const ex = allExercises.find(e => e.id === we.exercise_id) || {
        id: we.exercise_id, name: 'Exercício removido', created_by: null, is_active: false, created_at: ''
      };
      const sets = setList.filter(s => s.workout_exercise_id === we.id);
      const bestHistory = await this.getExerciseBestHistory(userId, we.exercise_id);

      result.push({
        ...we,
        exercise: ex,
        sets,
        bestHistorySummary: bestHistory.summary
      });
    }

    return result;
  },

  async startEmptyWorkoutSession(userId: string): Promise<WorkoutSession> {
    const existing = await this.getActiveSession(userId);
    if (existing) return existing;

    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      user_id: userId,
      source_routine_id: null,
      status: 'active',
      started_at: new Date().toISOString(),
      ended_at: null,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('workout_sessions').insert([newSession]);
    } else {
      localDB.workout_sessions = [...localDB.workout_sessions, newSession];
    }
    return newSession;
  },

  async startRoutineWorkoutSession(userId: string, routineId: string): Promise<WorkoutSession> {
    const existing = await this.getActiveSession(userId);
    if (existing) return existing;

    const routines = await this.getRoutines(userId);
    const targetRoutine = routines.find(r => r.id === routineId);

    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      user_id: userId,
      source_routine_id: routineId,
      status: 'active',
      started_at: new Date().toISOString(),
      ended_at: null,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('workout_sessions').insert([newSession]);
    } else {
      localDB.workout_sessions = [...localDB.workout_sessions, newSession];
    }

    if (targetRoutine && targetRoutine.exercises.length > 0) {
      for (const re of targetRoutine.exercises) {
        await this.addExerciseToWorkoutSession(newSession.id, re.exercise.id, userId, re.position);
      }
    }

    return newSession;
  },

  async addExerciseToWorkoutSession(sessionId: string, exerciseId: string, userId: string, position?: number): Promise<WorkoutExerciseWithSets> {
    const currentExercises = await this.getWorkoutExercisesWithSets(sessionId, userId);
    const nextPosition = position ?? (currentExercises.length + 1);

    const weId = crypto.randomUUID();
    const newWE: WorkoutExercise = {
      id: weId,
      workout_session_id: sessionId,
      exercise_id: exerciseId,
      position: nextPosition,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('workout_exercises').insert([newWE]);
    } else {
      localDB.workout_exercises = [...localDB.workout_exercises, newWE];
    }

    const predefinedSets = await this.getExercisePredefinedSets(userId, exerciseId);
    const setsToInsert: WorkoutSet[] = predefinedSets.map((ps, index) => ({
      id: crypto.randomUUID(),
      workout_exercise_id: weId,
      set_number: index + 1,
      weight: ps.weight,
      reps: ps.reps,
      is_completed: false,
      created_at: new Date().toISOString()
    }));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('workout_sets').insert(setsToInsert);
    } else {
      localDB.workout_sets = [...localDB.workout_sets, ...setsToInsert];
    }

    const allExercises = await this.getExercises();
    const ex = allExercises.find(e => e.id === exerciseId)!;
    const bestHistory = await this.getExerciseBestHistory(userId, exerciseId);

    return {
      ...newWE,
      exercise: ex,
      sets: setsToInsert,
      bestHistorySummary: bestHistory.summary
    };
  },

  async removeExerciseFromWorkoutSession(workoutExerciseId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('workout_exercises').delete().eq('id', workoutExerciseId);
    } else {
      localDB.workout_exercises = localDB.workout_exercises.filter(we => we.id !== workoutExerciseId);
      localDB.workout_sets = localDB.workout_sets.filter(s => s.workout_exercise_id !== workoutExerciseId);
    }
  },

  async reorderWorkoutExercises(exercises: { id: string; position: number }[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      for (const ex of exercises) {
        await supabase.from('workout_exercises').update({ position: ex.position }).eq('id', ex.id);
      }
    } else {
      const map = new Map(exercises.map(e => [e.id, e.position]));
      localDB.workout_exercises = localDB.workout_exercises.map(we => 
        map.has(we.id) ? { ...we, position: map.get(we.id)! } : we
      );
    }
  },

  async addSetToWorkoutExercise(workoutExerciseId: string, prevWeight: number | null, prevReps: number | null): Promise<WorkoutSet> {
    let currentSets: WorkoutSet[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('workout_sets').select('*').eq('workout_exercise_id', workoutExerciseId).order('set_number', { ascending: true });
      currentSets = (data || []) as WorkoutSet[];
    } else {
      currentSets = localDB.workout_sets.filter(s => s.workout_exercise_id === workoutExerciseId).sort((a, b) => a.set_number - b.set_number);
    }

    const nextNumber = currentSets.length + 1;
    const newSet: WorkoutSet = {
      id: crypto.randomUUID(),
      workout_exercise_id: workoutExerciseId,
      set_number: nextNumber,
      weight: prevWeight,
      reps: prevReps,
      is_completed: false,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('workout_sets').insert([newSet]);
    } else {
      localDB.workout_sets = [...localDB.workout_sets, newSet];
    }
    return newSet;
  },

  async updateSet(setId: string, updates: Partial<WorkoutSet>): Promise<void> {
    const updatedWithTime = { ...updates, updated_at: new Date().toISOString() };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('workout_sets').update(updatedWithTime).eq('id', setId);
    } else {
      localDB.workout_sets = localDB.workout_sets.map(s => s.id === setId ? { ...s, ...updatedWithTime } : s);
    }
  },

  async removeSet(setId: string, workoutExerciseId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('workout_sets').delete().eq('id', setId);
      const { data: remaining } = await supabase.from('workout_sets').select('*').eq('workout_exercise_id', workoutExerciseId).order('set_number', { ascending: true });
      if (remaining) {
        for (let i = 0; i < remaining.length; i++) {
          await supabase.from('workout_sets').update({ set_number: i + 1 }).eq('id', remaining[i].id);
        }
      }
    } else {
      localDB.workout_sets = localDB.workout_sets.filter(s => s.id !== setId);
      const remaining = localDB.workout_sets
        .filter(s => s.workout_exercise_id === workoutExerciseId)
        .sort((a, b) => a.set_number - b.set_number);
      
      const idToNumber = new Map(remaining.map((s, index) => [s.id, index + 1]));
      localDB.workout_sets = localDB.workout_sets.map(s => 
        idToNumber.has(s.id) ? { ...s, set_number: idToNumber.get(s.id)! } : s
      );
    }
  },

  async finishWorkoutSession(sessionId: string, action: 'completed' | 'discarded'): Promise<void> {
    if (action === 'discarded') {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('workout_sessions').update({ status: 'discarded', ended_at: new Date().toISOString() }).eq('id', sessionId);
      } else {
        localDB.workout_sessions = localDB.workout_sessions.map(s => s.id === sessionId ? { ...s, status: 'discarded', ended_at: new Date().toISOString() } : s);
      }
      return;
    }

    let allWE: WorkoutExercise[] = [];
    let allSets: WorkoutSet[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data: weData } = await supabase.from('workout_exercises').select('*').eq('workout_session_id', sessionId);
      allWE = (weData || []) as WorkoutExercise[];
      if (allWE.length > 0) {
        const weIds = allWE.map(we => we.id);
        const { data: setData } = await supabase.from('workout_sets').select('*').in('workout_exercise_id', weIds);
        allSets = (setData || []) as WorkoutSet[];
      }
    } else {
      allWE = localDB.workout_exercises.filter(we => we.workout_session_id === sessionId);
      const weIds = allWE.map(we => we.id);
      allSets = localDB.workout_sets.filter(s => weIds.includes(s.workout_exercise_id));
    }

    for (const we of allWE) {
      const completedSetsCount = allSets.filter(s => s.workout_exercise_id === we.id && s.is_completed).length;
      if (completedSetsCount === 0) {
        await this.removeExerciseFromWorkoutSession(we.id);
      } else {
        const uncompletedSets = allSets.filter(s => s.workout_exercise_id === we.id && !s.is_completed);
        for (const us of uncompletedSets) {
          if (isSupabaseConfigured && supabase) {
            await supabase.from('workout_sets').delete().eq('id', us.id);
          } else {
            localDB.workout_sets = localDB.workout_sets.filter(s => s.id !== us.id);
          }
        }
      }
    }

    const nowIso = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      await supabase.from('workout_sessions').update({ status: 'completed', ended_at: nowIso }).eq('id', sessionId);
    } else {
      localDB.workout_sessions = localDB.workout_sessions.map(s => s.id === sessionId ? { ...s, status: 'completed', ended_at: nowIso } : s);
    }
  },

  async getCompletedSessions(userId: string): Promise<WorkoutSession[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('started_at', { ascending: false });
      return (data || []) as WorkoutSession[];
    }
    return localDB.workout_sessions
      .filter(s => s.user_id === userId && s.status === 'completed')
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  },

  async getSessionDetail(sessionId: string, userId: string): Promise<{ session: WorkoutSession | null; exercises: WorkoutExerciseWithSets[] }> {
    let session: WorkoutSession | null = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('workout_sessions').select('*').eq('id', sessionId).single();
      session = data as WorkoutSession;
    } else {
      session = localDB.workout_sessions.find(s => s.id === sessionId) || null;
    }

    if (!session) return { session: null, exercises: [] };
    const exercises = await this.getWorkoutExercisesWithSets(sessionId, userId);
    return { session, exercises };
  },

  async getExercisePersonalHistory(userId: string, exerciseId: string): Promise<{
    date: string;
    sessionId: string;
    sets: WorkoutSet[];
  }[]> {
    const completedSessions = await this.getCompletedSessions(userId);
    const result: { date: string; sessionId: string; sets: WorkoutSet[] }[] = [];

    for (const session of completedSessions) {
      const weList = await this.getWorkoutExercisesWithSets(session.id, userId);
      const targetWE = weList.find(we => we.exercise_id === exerciseId);
      if (targetWE && targetWE.sets.length > 0) {
        const completedSets = targetWE.sets.filter(s => s.is_completed);
        if (completedSets.length > 0) {
          result.push({
            date: session.started_at,
            sessionId: session.id,
            sets: completedSets
          });
        }
      }
    }

    return result;
  }
};
