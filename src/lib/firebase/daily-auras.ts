"use client";

import type { AuraMetrics, AuraPalette } from "@/lib/aura/types";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseFirestore } from "./client";

export const DAILY_AURAS_COLLECTION = "daily_auras" as const;

export interface DailyAuraDocument {
  userId: string;
  /** Calendar day in UTC, `YYYY-MM-DD` */
  dateKey: string;
  social: number;
  chaos: number;
  focus: number;
  sleep: number;
  palette: AuraPalette;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export function dailyAuraDocId(userId: string, dateKey: string): string {
  return `${userId}_${dateKey}`;
}

export function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export async function saveDailyAura(input: {
  userId: string;
  dateKey?: string;
  metrics: AuraMetrics;
  palette: AuraPalette;
}): Promise<void> {
  const db = getFirebaseFirestore();
  const dateKey = input.dateKey ?? utcDateKey();
  const id = dailyAuraDocId(input.userId, dateKey);
  const ref = doc(db, DAILY_AURAS_COLLECTION, id);
  const existing = await getDoc(ref);
  const base = {
    userId: input.userId,
    dateKey,
    social: input.metrics.social,
    chaos: input.metrics.chaos,
    focus: input.metrics.focus,
    sleep: input.metrics.sleep,
    palette: input.palette,
    updatedAt: serverTimestamp(),
  };
  await setDoc(
    ref,
    existing.exists()
      ? base
      : { ...base, createdAt: serverTimestamp() },
    { merge: true },
  );
}

export async function getDailyAura(
  userId: string,
  dateKey: string,
): Promise<DailyAuraDocument | null> {
  const db = getFirebaseFirestore();
  const id = dailyAuraDocId(userId, dateKey);
  const snap = await getDoc(doc(db, DAILY_AURAS_COLLECTION, id));
  if (!snap.exists()) return null;
  return snap.data() as DailyAuraDocument;
}

export function subscribeDailyAura(
  userId: string,
  dateKey: string,
  onData: (doc: DailyAuraDocument | null) => void,
): Unsubscribe {
  const db = getFirebaseFirestore();
  const id = dailyAuraDocId(userId, dateKey);
  return onSnapshot(doc(db, DAILY_AURAS_COLLECTION, id), (snap) => {
    if (!snap.exists()) {
      onData(null);
      return;
    }
    onData(snap.data() as DailyAuraDocument);
  });
}
