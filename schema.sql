-- ==============================================================================
-- APP DE REGISTO DE TREINOS - ESPECIFICAÇÃO SUPABASE SQL SCHEMA
-- Otimizado para Supabase PostgreSQL (com Row Level Security & Estrutura Completa)
-- ==============================================================================

-- 1. TABELA DE PERFIS DE UTILIZADORES (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Para MVP auth simples (ou mapeado com auth.users)
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. BIBLIOTECA GLOBAL DE EXERCÍCIOS (exercises)
-- Partilhada entre todos os utilizadores
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  muscle_group TEXT,
  equipment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ROTINAS (routines)
-- Pertencem individualmente a cada utilizador
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EXERCÍCIOS DA ROTINA (routine_exercises)
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SESSÕES DE TREINO (workout_sessions)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discarded')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. EXERCÍCIOS DA SESSÃO DE TREINO (workout_exercises)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SÉRIES DA SESSÃO DE TREINO (workout_sets)
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL DEFAULT 1,
  weight NUMERIC(6, 2) DEFAULT NULL,
  reps INTEGER DEFAULT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- DADOS INICIAIS (SEED DATA)
-- ==============================================================================

-- Inserir Utilizador Administrador (Luís - pass Admin) e Utilizadora Sofia
INSERT INTO public.profiles (id, name, username, password_hash, role)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Luís (Administrador)', 'Admin', 'Admin', 'admin'),
  ('b2222222-2222-2222-2222-222222222222', 'Sofia Rodrigues', 'sofia', 'sofia123', 'user')
ON CONFLICT (username) DO NOTHING;

-- Inserir Biblioteca Global de Exercícios Inicial
INSERT INTO public.exercises (name, created_by, muscle_group, equipment)
VALUES 
  ('Supino com barra', 'a1111111-1111-1111-1111-111111111111', 'Peito', 'Barra'),
  ('Supino inclinado com halteres', 'a1111111-1111-1111-1111-111111111111', 'Peito', 'Halteres'),
  ('Crucifixo na máquina', 'a1111111-1111-1111-1111-111111111111', 'Peito', 'Máquina'),
  ('Agachamento livre com barra', 'a1111111-1111-1111-1111-111111111111', 'Pernas', 'Barra'),
  ('Leg Press 45º', 'a1111111-1111-1111-1111-111111111111', 'Pernas', 'Máquina'),
  ('Cadeira extensora', 'a1111111-1111-1111-1111-111111111111', 'Pernas', 'Máquina'),
  ('Puxada na frente com barra reta', 'a1111111-1111-1111-1111-111111111111', 'Costas', 'Polia'),
  ('Remada curvada com barra', 'a1111111-1111-1111-1111-111111111111', 'Costas', 'Barra'),
  ('Desenvolvimento militar com halteres', 'a1111111-1111-1111-1111-111111111111', 'Ombros', 'Halteres'),
  ('Elevação lateral com halteres', 'a1111111-1111-1111-1111-111111111111', 'Ombros', 'Halteres'),
  ('Rosca direta com barra W', 'a1111111-1111-1111-1111-111111111111', 'Bíceps', 'Barra'),
  ('Tríceps na polia com corda', 'a1111111-1111-1111-1111-111111111111', 'Tríceps', 'Polia')
ON CONFLICT (name) DO NOTHING;

-- Exemplo de Rotina inicial para Luís
INSERT INTO public.routines (id, user_id, name)
VALUES 
  ('c3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Peito e Tríceps')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- Exemplo simplificado para consulta (em ambiente Supabase real com auth.uid())
CREATE POLICY "Permitir leitura de exercícios globais a todos" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Permitir criação de exercícios a todos autenticados" ON public.exercises FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura e escrita ao administrador Luís em tudo" ON public.profiles FOR ALL USING (true);
