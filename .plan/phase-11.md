# Phase 11 — PWA-Konfiguration

**Status:** 🔲 Offen
**Abhängigkeiten:** Phase 6, 8, 10
**Gibt frei:** — (letzte Phase)

## Ziel
Hector als installierbare PWA: Nutzer können die Web-App auf iOS und Android wie eine native App installieren. Offline-Grundfunktionen (gecachte Seiten), App-like UX (kein Browser-Chrome, Status Bar), Push-Notifications vorbereitet.

---

## Schritt 11.1 — Web App Manifest

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `manifest.json` erstellen | `public/manifest.json` | 🔲 |
| `name`, `short_name` = "Hector" | `public/manifest.json` | 🔲 |
| `display: "standalone"` (kein Browser-Chrome) | `public/manifest.json` | 🔲 |
| `background_color` = `#0f0f0f` (Dark für Splash) | `public/manifest.json` | 🔲 |
| `theme_color` = `rgb(0, 209, 150)` (Akzent für Status Bar) | `public/manifest.json` | 🔲 |
| `start_url` = `/` | `public/manifest.json` | 🔲 |
| `orientation: "portrait"` | `public/manifest.json` | 🔲 |
| `scope: "/"` | `public/manifest.json` | 🔲 |
| Manifest in `<head>` einbinden | `app/layout.tsx` | 🔲 |

---

## Schritt 11.2 — PWA Icons

| Aufgabe | Datei | Status |
|---------|-------|--------|
| Icon 192×192 (PNG) | `public/icons/icon-192.png` | 🔲 |
| Icon 512×512 (PNG) | `public/icons/icon-512.png` | 🔲 |
| Icon 512×512 maskable (für Android Adaptive Icons) | `public/icons/icon-512-maskable.png` | 🔲 |
| Apple Touch Icon 180×180 | `public/icons/apple-touch-icon.png` | 🔲 |
| Favicon 32×32 + 16×16 | `public/favicon.ico` | 🔲 |
| Icons im Manifest registrieren | `public/manifest.json` | 🔲 |
| Apple Meta-Tags in `<head>` | `app/layout.tsx` | 🔲 |

**Apple Meta-Tags:**
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Hector" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

---

## Schritt 11.3 — Service Worker (next-pwa)

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `next-pwa` in `next.config.ts` konfigurieren | `next.config.ts` | 🔲 |
| Service Worker nur in Production aktivieren | `next.config.ts` | 🔲 |
| Cache-Strategie: **Network First** für API-Calls | `next.config.ts` | 🔲 |
| Cache-Strategie: **Cache First** für statische Assets (JS, CSS, Fonts) | `next.config.ts` | 🔲 |
| Cache-Strategie: **Stale While Revalidate** für Seiten | `next.config.ts` | 🔲 |
| Offline-Fallback-Seite | `public/offline.html` | 🔲 |

```javascript
// next.config.ts (next-pwa)
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^\/api\/v1\//,
      handler: 'NetworkFirst',
      options: { cacheName: 'api-cache', networkTimeoutSeconds: 10 }
    },
    {
      urlPattern: /\.(js|css|woff2)$/,
      handler: 'CacheFirst',
      options: { cacheName: 'static-cache' }
    }
  ]
})
```

---

## Schritt 11.4 — Mobile UX-Optimierungen

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `viewport` Meta-Tag mit `viewport-fit=cover` (iPhone Notch) | `app/layout.tsx` | 🔲 |
| `env(safe-area-inset-bottom)` für Bottom Navigation | `components/layout/BottomNav/BottomNav.module.less` | 🔲 |
| Touch-Highlights deaktivieren (`-webkit-tap-highlight-color: transparent`) | `styles/reset.less` | 🔲 |
| Overscroll-Behavior auf Body (`overscroll-behavior: none`) | `styles/reset.less` | 🔲 |
| Pull-to-Refresh deaktivieren (optional, verhindert versehentliches Reload) | `styles/reset.less` | 🔲 |
| Input-Zoom auf iOS verhindern (`font-size: 16px` auf Inputs) | `styles/reset.less` | 🔲 |

---

## Schritt 11.5 — Install-Prompt

| Aufgabe | Datei | Status |
|---------|-------|--------|
| `beforeinstallprompt` Event abfangen | `lib/hooks/usePwaInstall.ts` | 🔲 |
| "App installieren" Button in Settings anzeigen wenn installierbar | `app/(app)/settings/page.tsx` | 🔲 |
| Nach Installation: Button ausblenden | `lib/hooks/usePwaInstall.ts` | 🔲 |
| iOS: Anleitung "Teilen → Zum Home-Bildschirm" anzeigen | `lib/hooks/usePwaInstall.ts` | 🔲 |

---

## Verzeichnisstruktur nach Phase 11

```
hector/
└── public/
    ├── manifest.json
    ├── offline.html
    ├── sw.js                    ← generiert von next-pwa
    ├── workbox-*.js             ← generiert von next-pwa
    ├── favicon.ico
    └── icons/
        ├── icon-192.png
        ├── icon-512.png
        ├── icon-512-maskable.png
        └── apple-touch-icon.png
```

---

## Testkriterien

- [ ] Lighthouse PWA-Score ≥ 90
- [ ] Chrome DevTools: "App is installable" ✓
- [ ] iOS Safari: "Zum Home-Bildschirm" → App startet ohne Browser-Chrome
- [ ] Android Chrome: Install-Banner erscheint oder Menü-Option vorhanden
- [ ] Offline: gecachte Seiten laden, API-Fehler werden graceful behandelt
- [ ] Status Bar auf iPhone zeigt Akzentfarbe (theme_color)
- [ ] App-Icon auf Home Screen korrekt (kein weißer Rand auf Android)
- [ ] `overscroll-behavior: none` verhindert versehentliches Pull-to-Refresh
