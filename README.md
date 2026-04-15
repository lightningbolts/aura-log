# AuraLog (web)

Next.js app for **AuraLog** — WebGL aura background, Firebase Auth, Firestore `daily_auras`, and share export.

## Setup

1. Copy `.env.example` → `.env.local` and fill in Firebase **web** config (Project settings → Your apps → Web app).

2. In Firebase Console, enable **Google** and **Apple** sign-in providers.

3. Deploy Firestore rules (see `firestore.rules` in this folder) so users can only read/write their own `daily_auras` documents.

Run commands from **`aura-log/`** (the folder that contains this `package.json`), not the parent `AuraLog/` folder — otherwise Turbopack can resolve modules from the wrong directory.

```bash
cd aura-log
npm install
npm run dev
```

## Key paths

| Area | Path |
|------|------|
| Aura shader + hook | `src/hooks/useAuraGradient.ts` |
| WebGL canvas | `src/components/aura/BackgroundCanvas.tsx` |
| Main UI (from `ui-start.html`) | `src/components/aura/AuraHomeExperience.tsx` |
| Firebase config | `src/lib/firebase/firebase.config.ts` |
| Client app / Auth / Firestore | `src/lib/firebase/client.ts`, `auth-actions.ts`, `daily-auras.ts` |
| Export (watermark) | `src/lib/export/capture-with-watermark.ts` |

## iOS / Swift

The shared Swift package lives in `../aura-log-app/aura-log-app/` (Metal shader + `FirebaseApp.configure()` helpers). Use the same Firebase **project** as the web `.env.local` values.

See `../aura-log-app/GoogleService-Info.plist.example` for the plist you add to the Xcode app target.
