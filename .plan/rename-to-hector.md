# Rename: Taskisix → Hector

## Ziel
Alle Vorkommen von „Taskisix" / „taskisix" im aktiven Quellcode und in der Konfiguration durch „Hector" / „hector" ersetzen.
Build-Artefakte (`.next/`) werden ignoriert — sie entstehen beim nächsten Build neu.

---

## Aufgaben

### Task 1 — package.json
**Datei:** `package.json`
- `"name": "taskisix"` → `"name": "hector"`

---

### Task 2 — package-lock.json
**Datei:** `package-lock.json`
- Beide Vorkommen `"name": "taskisix"` → `"name": "hector"`
  (Zeile 1 im Root-Objekt und Zeile im `packages[""]`-Eintrag)

---

### Task 3 — App-Metadaten (Tab-Titel, OG-Tags)
**Datei:** `app/layout.tsx`
- `title: "Taskisix"` → `title: "Hector"`
- Alle weiteren Metadaten-Felder prüfen (`description`, `openGraph.title` usw.) und ggf. anpassen.

---

### Task 4 — Login-Seite
**Datei:** `app/login/page.tsx` (oder `app/(auth)/login/page.tsx`)
- Sichtbaren Text `Taskisix` → `Hector`

---

### Task 5 — Sidebar Wordmark
**Datei:** `components/layout/Sidebar/Sidebar.tsx`
- `<div className={styles.wordmark}>Taskisix</div>` → `Hector`

---

### Task 6 — Plan-Dokumentation (.plan/)
**Dateien:** `.plan/README.md`, `.plan/phase-05.md`, `.plan/phase-06.md`, `.plan/phase-09.md`, `.plan/phase-10.md`, `.plan/phase-11.md`
- Alle Vorkommen von „Taskisix" / „taskisix" in Fließtext ersetzen.
- Verzeichnispfade wie `taskisix/` in Beispielen → `hector/`

---

### Task 7 — Verifikation
Nach allen Änderungen:
1. `grep -ri "taskisix" . --include="*.ts" --include="*.tsx" --include="*.less" --include="*.json" --include="*.md" --exclude-dir=node_modules --exclude-dir=.next` → muss leer sein.
2. `npx tsc --noEmit` → keine Fehler.
3. `npm run build` (optional, zum abschließenden Smoke-Test).

---

## Nicht anfassen
- `.next/` — Build-Artefakte, werden neu generiert
- `node_modules/` — externe Pakete
- Git-History (kein rebase/amend)
