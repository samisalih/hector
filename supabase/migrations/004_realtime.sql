-- ─── Realtime Publications ────────────────────────────────────────────────────
-- Aktiviert Supabase Realtime für alle relevanten Tabellen.
-- Clients können Änderungen per WebSocket-Channel empfangen.

ALTER PUBLICATION supabase_realtime ADD TABLE public.task_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subtasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_entries;
