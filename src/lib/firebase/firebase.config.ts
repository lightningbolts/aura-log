import type { FirebaseOptions } from "firebase/app";

function requirePublicEnv(
  value: string | undefined,
  name:
    | "NEXT_PUBLIC_FIREBASE_API_KEY"
    | "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    | "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    | "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    | "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    | "NEXT_PUBLIC_FIREBASE_APP_ID",
): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `[AuraLog] Missing ${name}. Copy .env.example to .env.local (next to package.json) and restart \`npm run dev\`.`,
    );
  }
  return value;
}

/**
 * Firebase web SDK options (public keys only — safe for the client bundle).
 * Each value must be read via a **static** `process.env.NEXT_PUBLIC_*` lookup so
 * Next.js can inline them into the browser bundle (dynamic `process.env[key]` is empty client-side).
 */
export function getFirebaseOptions(): FirebaseOptions {
  return {
    apiKey: requirePublicEnv(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      "NEXT_PUBLIC_FIREBASE_API_KEY",
    ),
    authDomain: requirePublicEnv(
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    ),
    projectId: requirePublicEnv(
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    ),
    storageBucket: requirePublicEnv(
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    ),
    messagingSenderId: requirePublicEnv(
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    ),
    appId: requirePublicEnv(
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ),
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}
