'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error) => {
    console.error("Anonymous sign-in failed:", error);
  });
}

/** Initiate email/password sign-up. Returns a promise to allow UI error handling. */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<any> {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in. Returns a promise to allow UI error handling. */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<any> {
  return signInWithEmailAndPassword(authInstance, email, password);
}
