-- ─── Profiles ────────────────────────────────────────────────────────────────
-- Wird automatisch befüllt durch den handle_new_user()-Trigger (003_functions.sql)
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  display_name    TEXT,
  theme           TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Task Lists ───────────────────────────────────────────────────────────────
CREATE TABLE public.task_lists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  color           TEXT,              -- Hex-Farbe, z.B. '#4d9fff'
  icon            TEXT,              -- Emoji oder Icon-Bezeichner
  position        INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tasks ────────────────────────────────────────────────────────────────────
CREATE TABLE public.tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id         UUID NOT NULL REFERENCES public.task_lists(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  due_date        DATE,
  due_time        TIME,
  position        INTEGER NOT NULL DEFAULT 0,
  priority        TEXT NOT NULL DEFAULT 'none'
                    CHECK (priority IN ('none', 'low', 'medium', 'high')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Subtasks ─────────────────────────────────────────────────────────────────
CREATE TABLE public.subtasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  position        INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Time Entries ─────────────────────────────────────────────────────────────
CREATE TABLE public.time_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id          UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,          -- NULL = Timer läuft noch
  duration_seconds INTEGER,              -- Wird beim Stoppen gesetzt, oder manuell
  notes            TEXT,
  is_manual        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── API Keys ─────────────────────────────────────────────────────────────────
CREATE TABLE public.api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,         -- Anzeigename, z.B. 'MCP Server'
  key_hash        TEXT NOT NULL UNIQUE,  -- SHA-256 Hash des API-Keys
  key_prefix      TEXT NOT NULL,         -- Erste 12 Zeichen (tsx_abc12345...)
  last_used_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,           -- NULL = kein Ablauf
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indizes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_task_lists_user_id      ON public.task_lists(user_id);
CREATE INDEX idx_task_lists_position     ON public.task_lists(user_id, position);

CREATE INDEX idx_tasks_list_id           ON public.tasks(list_id);
CREATE INDEX idx_tasks_user_id           ON public.tasks(user_id);
CREATE INDEX idx_tasks_position          ON public.tasks(list_id, position);
CREATE INDEX idx_tasks_due_date          ON public.tasks(due_date)
  WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_completed         ON public.tasks(user_id, is_completed);

CREATE INDEX idx_subtasks_task_id        ON public.subtasks(task_id);
CREATE INDEX idx_subtasks_position       ON public.subtasks(task_id, position);

CREATE INDEX idx_time_entries_task_id    ON public.time_entries(task_id);
CREATE INDEX idx_time_entries_user_id    ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_started_at ON public.time_entries(user_id, started_at DESC);
-- Partial Index: schneller Zugriff auf laufende Timer
CREATE INDEX idx_time_entries_active     ON public.time_entries(user_id)
  WHERE ended_at IS NULL;

CREATE INDEX idx_api_keys_user_id        ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_hash           ON public.api_keys(key_hash);

-- ─── updated_at Trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_task_lists_updated_at
  BEFORE UPDATE ON public.task_lists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_subtasks_updated_at
  BEFORE UPDATE ON public.subtasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
