-- ─── RLS aktivieren ───────────────────────────────────────────────────────────
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_lists   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys     ENABLE ROW LEVEL SECURITY;

-- ─── profiles ─────────────────────────────────────────────────────────────────
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── task_lists ───────────────────────────────────────────────────────────────
CREATE POLICY "task_lists: select own"
  ON public.task_lists FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "task_lists: insert own"
  ON public.task_lists FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "task_lists: update own"
  ON public.task_lists FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "task_lists: delete own"
  ON public.task_lists FOR DELETE
  USING (user_id = auth.uid());

-- ─── tasks ────────────────────────────────────────────────────────────────────
CREATE POLICY "tasks: select own"
  ON public.tasks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "tasks: insert own"
  ON public.tasks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks: update own"
  ON public.tasks FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks: delete own"
  ON public.tasks FOR DELETE
  USING (user_id = auth.uid());

-- ─── subtasks ─────────────────────────────────────────────────────────────────
CREATE POLICY "subtasks: select own"
  ON public.subtasks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "subtasks: insert own"
  ON public.subtasks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "subtasks: update own"
  ON public.subtasks FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "subtasks: delete own"
  ON public.subtasks FOR DELETE
  USING (user_id = auth.uid());

-- ─── time_entries ─────────────────────────────────────────────────────────────
CREATE POLICY "time_entries: select own"
  ON public.time_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "time_entries: insert own"
  ON public.time_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "time_entries: update own"
  ON public.time_entries FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "time_entries: delete own"
  ON public.time_entries FOR DELETE
  USING (user_id = auth.uid());

-- ─── api_keys ─────────────────────────────────────────────────────────────────
CREATE POLICY "api_keys: select own"
  ON public.api_keys FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "api_keys: insert own"
  ON public.api_keys FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "api_keys: delete own"
  ON public.api_keys FOR DELETE
  USING (user_id = auth.uid());
