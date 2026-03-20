# taskisix

A personal task management app with integrated time tracking, built as a Progressive Web App (PWA).

## Features

- **Task lists** — organize tasks into color-coded, icon-labeled lists
- **Tasks** — set priorities (none / low / medium / high), due dates, descriptions, and subtasks
- **Drag & drop** — reorder tasks and lists
- **Time tracking** — start/stop timers per task, log manual entries, view daily totals
- **Marked tasks** — quick access to flagged items
- **REST API** — full `v1` API for external integrations (e.g. MCP server)
- **API key management** — generate and rotate personal API keys
- **Realtime sync** — changes propagate instantly via Supabase WebSockets
- **PWA** — installable on mobile and desktop, works offline

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Less, Motion |
| Backend / Auth | Supabase (PostgreSQL + Auth + Realtime) |
| Validation | Zod |
| Language | TypeScript |

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy the environment file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Apply the database migrations in order using the Supabase dashboard or CLI:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_functions.sql
supabase/migrations/004_realtime.sql
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API

The REST API is available at `/api/v1/`. Authentication uses either a Supabase session cookie or a personal API key (via `Authorization: Bearer <key>` header).

Key endpoints:

| Method | Path | Description |
|---|---|---|
| `GET/POST` | `/api/v1/lists` | List and create task lists |
| `GET/PATCH/DELETE` | `/api/v1/lists/:listId` | Manage a single list |
| `GET/POST` | `/api/v1/lists/:listId/tasks` | List and create tasks |
| `GET/PATCH/DELETE` | `/api/v1/tasks/:taskId` | Manage a task |
| `GET/POST` | `/api/v1/tasks/:taskId/subtasks` | Manage subtasks |
| `GET/POST` | `/api/v1/tasks/:taskId/time-entries` | Log time entries |
| `GET` | `/api/v1/timers/active` | Get the currently running timer |
| `GET/POST` | `/api/v1/api-keys` | Manage API keys |
| `GET` | `/api/v1/me` | Current user profile |

## Database

Row Level Security (RLS) is enabled on all tables — every user can only access their own data. The schema includes:

- `profiles` — auto-created on sign-up via trigger
- `task_lists` — lists with color and icon
- `tasks` — with priority, due date/time, and position for ordering
- `subtasks` — nested under tasks
- `time_entries` — time tracking records (supports active/running timers)
- `api_keys` — hashed API keys with optional expiry

## Generating TypeScript Types

After schema changes, regenerate the Supabase types:

```bash
npm run gen:types
```
