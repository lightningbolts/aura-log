"use client";

import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseOptions } from "./firebase.config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebaseClientApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase must be initialized in the browser.");
  }
  if (!app) {
    const options = getFirebaseOptions();
    app = getApps().length ? getApps()[0]! : initializeApp(options);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseClientApp());
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseClientApp());
  }
  return db;
}
