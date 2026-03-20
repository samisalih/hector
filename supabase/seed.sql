-- ─── Seed Data (nur für lokale Entwicklung) ───────────────────────────────────
-- Dieses Script setzt voraus, dass bereits ein User in auth.users existiert.
-- Ersetze die UUID mit der ID deines lokalen Test-Users.

-- Beispiel-Listen und Tasks (auskommentiert bis ein User-UUID bekannt ist):

-- INSERT INTO public.task_lists (user_id, title, color, position)
-- VALUES
--   ('<USER_UUID>', 'Persönlich', '#4d9fff', 0),
--   ('<USER_UUID>', 'Arbeit',     '#f5a623', 1),
--   ('<USER_UUID>', 'Projekte',   '#00d196', 2);
