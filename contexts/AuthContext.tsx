'use client';

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!auth) return;
      await createUserWithEmailAndPassword(auth, email, password);
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!auth) return;
      await signInWithEmailAndPassword(auth, email, password);
    },
    []
  );

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signUp,
    signIn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
