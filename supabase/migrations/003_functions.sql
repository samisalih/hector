-- ─── handle_new_user ──────────────────────────────────────────────────────────
-- Erstellt automatisch einen profiles-Eintrag wenn sich ein neuer User registriert.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── get_active_timer ─────────────────────────────────────────────────────────
-- Gibt den laufenden Timer eines Users zurück (ended_at IS NULL).
CREATE OR REPLACE FUNCTION public.get_active_timer(p_user_id UUID)
RETURNS TABLE (
  entry_id    UUID,
  task_id     UUID,
  started_at  TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, task_id, started_at
  FROM public.time_entries
  WHERE user_id = p_user_id
    AND ended_at IS NULL
  ORDER BY started_at DESC
  LIMIT 1;
$$;

-- ─── get_task_total_duration ──────────────────────────────────────────────────
-- Gibt die Gesamtdauer (in Sekunden) aller abgeschlossenen Zeiteinträge für einen Task.
CREATE OR REPLACE FUNCTION public.get_task_total_duration(p_task_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(duration_seconds), 0)::INTEGER
  FROM public.time_entries
  WHERE task_id = p_task_id
    AND ended_at IS NOT NULL
    AND duration_seconds IS NOT NULL;
$$;

-- ─── reorder_tasks ────────────────────────────────────────────────────────────
-- Setzt die position-Felder von Tasks nach einem Drag & Drop.
-- p_task_ids: Array von Task-UUIDs in der gewünschten Reihenfolge.
CREATE OR REPLACE FUNCTION public.reorder_tasks(
  p_list_id  UUID,
  p_user_id  UUID,
  p_task_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i         INTEGER := 0;
  v_task_id UUID;
BEGIN
  FOREACH v_task_id IN ARRAY p_task_ids LOOP
    UPDATE public.tasks
    SET position = i
    WHERE id = v_task_id
      AND list_id = p_list_id
      AND user_id = p_user_id;
    i := i + 1;
  END LOOP;
END;
$$;

-- ─── reorder_lists ────────────────────────────────────────────────────────────
-- Setzt die position-Felder von Task Lists nach einem Drag & Drop.
CREATE OR REPLACE FUNCTION public.reorder_lists(
  p_user_id  UUID,
  p_list_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i         INTEGER := 0;
  v_list_id UUID;
BEGIN
  FOREACH v_list_id IN ARRAY p_list_ids LOOP
    UPDATE public.task_lists
    SET position = i
    WHERE id = v_list_id
      AND user_id = p_user_id;
    i := i + 1;
  END LOOP;
END;
$$;
