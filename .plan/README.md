# Hector — Implementierungsplan

Dieses Verzeichnis enthält den vollständigen Bauplan für Hector.
Jede Phase hat eine eigene Datei mit detailliertem Plan und Statustracking.

## Phasenübersicht

| Phase | Datei | Titel | Status |
|-------|-------|-------|--------|
| 1 | [phase-01.md](./phase-01.md) | Fundament & Datenbankschema | ✅ Fertig |
| 2 | [phase-02.md](./phase-02.md) | TypeScript Typen | ✅ Fertig |
| 3 | [phase-03.md](./phase-03.md) | Supabase Clients & Next.js Proxy | ✅ Fertig |
| 4 | [phase-04.md](./phase-04.md) | Service Layer (Pre-Backend) | ✅ Fertig |
| 5 | [phase-05.md](\./phase-05.md) | REST-API vollständig | ✅ Fertig |
| 6 | [phase-06.md](\./phase-06.md) | Frontend — Core Layout & Board | ✅ Fertig |
| 7 | [phase-07.md](./phase-07.md) | Frontend — Time Tracking UI | 🔄 In Arbeit |
| 8 | [phase-08.md](./phase-08.md) | Realtime & State Management | ✅ Fertig |
| 9 | [phase-09.md](./phase-09.md) | API-Key Management UI | ✅ Fertig |
| 10 | [phase-10.md](./phase-10.md) | Auth-Flows | ✅ Fertig |
| 11 | [phase-11.md](./phase-11.md) | PWA-Konfiguration | 🔲 Offen |

## Legende

| Symbol | Bedeutung |
|--------|-----------|
| 🔲 Offen | Noch nicht begonnen |
| 🔄 In Arbeit | Aktuell in Bearbeitung |
| ✅ Fertig | Implementiert & verifiziert |
| ⏸ Blockiert | Warte auf Abhängigkeit |
| 🔁 Überarbeitung | Muss nochmal angefasst werden |

## Architektur-Übersicht

```
┌─────────────────────────────────────────────┐
│  Frontend (Next.js, PWA)                    │  Phase 6–9, 10, 11
│  app/(app)/ + components/ + lib/hooks/      │
└──────────────────┬──────────────────────────┘
                   │ HTTP (intern)
┌──────────────────▼──────────────────────────┐
│  REST-API (Next.js API Routes /api/v1/)     │  Phase 5
│  Auth: Session-Cookie + API-Key             │
└──────────────────┬──────────────────────────┘
                   │ Service calls
┌──────────────────▼──────────────────────────┐
│  Service Layer (lib/services/)              │  Phase 4
│  Abstraktion aller DB-Operationen           │
└──────────────────┬──────────────────────────┘
                   │ Supabase SDK
┌──────────────────▼──────────────────────────┐
│  Supabase (Postgres + Auth + Realtime)      │  Phase 1
│  RLS, Migrations, Functions, Triggers       │
└─────────────────────────────────────────────┘
```
