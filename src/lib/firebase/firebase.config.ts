import type { FirebaseOptions } from "firebase/app";

const requiredKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export type FirebasePublicEnvKey = (typeof requiredKeys)[number];

function readEnv(key: FirebasePublicEnvKey): string {
  const v = process.env[key];
  if (!v || v.trim() === "") {
    throw new Error(
      `[AuraLog] Missing ${key}. Copy .env.example to .env.local and add your Firebase web app keys.`,
    );
  }
  return v;
}

/**
 * Firebase web SDK options (public keys only — safe for the client bundle).
 * Call from browser-only code paths (see `getFirebaseClientApp`).
 */
export function getFirebaseOptions(): FirebaseOptions {
  return {
    apiKey: readEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}
