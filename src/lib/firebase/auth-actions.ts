"use client";

import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./client";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInWithApple(): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await signInWithPopup(auth, appleProvider);
  return result.user;
}

export async function signOutEverywhere(): Promise<void> {
  await signOut(getFirebaseAuth());
}
