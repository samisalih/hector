# Sidebar Redesign

**Status:** 🔄 In Arbeit
**Abhängigkeiten:** Phase 6
**Gibt frei:** –

## Ziel

Die Sidebar wird auf drei schwebende Pills reduziert. Kein Listen-Bereich mehr.
Navigation und Nutzerkontext sind klar getrennt und visuell eigenständig.

---

## Vorher → Nachher

```
VORHER                        NACHHER
──────────────────────────    ──────────────────────────
Hector (Wordmark)             Hector (Wordmark)

[pill: All tasks            ] [pill: All tasks          ]
[      Tracked time         ] [      Tracked time        ]

── Divider ──
LISTS                         ↕ flex spacer
• Obolus-Group
• Intern
                              [pill: ⚙ Settings          ]

── Bottom ──
⚙ Settings                   [pill: Avatar  Sami Salih  ]
⬡ Sign out                   [      Free                 ]
```

---

## Schritt 1 — Listen-Sektion entfernen

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `lists` prop aus Sidebar entfernen (optional → weglassen) | `Sidebar.tsx` | 🔲 |
| `<section>` lists + divider entfernen | `Sidebar.tsx` | 🔲 |
| `SidebarProps.lists` Interface entfernen | `Sidebar.tsx` | 🔲 |
| Entsprechende Less-Klassen entfernen | `Sidebar.module.less` | 🔲 |
| `getLists`-Call + `lists` prop im App-Layout entfernen | `app/(app)/layout.tsx` | 🔲 |

---

## Schritt 2 — Settings als eigene floating Pill

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Settings-Link in eigenem `<nav>` mit `.pill`-Klasse | `Sidebar.tsx` | 🔲 |
| Styling analog zur Top-Pill (border, shadow, radius-xl) | `Sidebar.module.less` | 🔲 |

---

## Schritt 3 — User-Pill unten

| Aufgabe | Datei | Status |
|---------|-------|--------|
| User-Info als Props übergeben: `displayName`, `email`, `accountType` | `Sidebar.tsx` + `layout.tsx` | 🔲 |
| Initialen aus displayName/email extrahieren (Hilfsfunktion) | `Sidebar.tsx` | 🔲 |
| Avatar-Kreis mit Initialen (Gradient-Hintergrund) | `Sidebar.tsx` | 🔲 |
| Name + Account-Typ ("Free" / "Premium") als Text | `Sidebar.tsx` | 🔲 |
| Pill-Styling für User-Bereich (analog Top-Pill) | `Sidebar.module.less` | 🔲 |
| Sign-Out via Klick auf Pill (kleines Exit-Icon oder Hover-Overlay) | `Sidebar.tsx` | 🔲 |

**Account-Typ:** Vorerst `free` hardcoded. Feld `account_type` in `profiles`-Tabelle vorgesehen.

---

## Schritt 4 — Layout bereinigen

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `getLists` + `lists`-Prop aus `app/(app)/layout.tsx` entfernen | `layout.tsx` | 🔲 |
| Ungenutzte CSS-Klassen aus Sidebar.module.less entfernen | `Sidebar.module.less` | 🔲 |

---

## Verzeichnisstruktur nach Redesign

```
components/layout/Sidebar/
├── Sidebar.tsx          ← neu: kein lists prop, 3 floating pills
└── Sidebar.module.less  ← neu: reduziert, kein listen-styling
```

---

## Testkriterien

- [ ] Sidebar zeigt nur Wordmark + 3 Pills (Nav, Settings, User)
- [ ] Kein LISTS-Bereich mehr sichtbar
- [ ] Navigations-Links funktionieren (All tasks, Tracked time, Settings)
- [ ] Avatar-Kreis zeigt Initialen korrekt
- [ ] Account-Typ "Free" sichtbar
- [ ] Sign-Out noch möglich
