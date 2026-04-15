"use client";

import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getFirebaseAuth,
  getFirebaseClientApp,
  getFirebaseFirestore,
} from "@/lib/firebase/client";

export interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  user: User | null;
  authReady: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    const app = getFirebaseClientApp();
    const auth = getFirebaseAuth();
    const db = getFirebaseFirestore();
    setValue({ app, auth, db, user: null, authReady: false });
    const unsub = onAuthStateChanged(auth, (user) => {
      setValue({ app, auth, db, user, authReady: true });
    });
    return () => unsub();
  }, []);

  if (!value) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <p className="text-sm font-medium lowercase tracking-wide opacity-70">
          connecting to aura…
        </p>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error("useFirebase must be used within FirebaseProvider");
  }
  return ctx;
}
