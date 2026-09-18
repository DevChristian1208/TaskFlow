"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase";

export type AppUser = {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string | null;
  isGuest?: boolean;
};

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  function refreshUser() {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    setUser({
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || "User",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL,
      isGuest: false,
    });
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser(
            firebaseUser.isAnonymous
              ? {
                  uid: firebaseUser.uid,
                  displayName: "Gast",
                  isGuest: true,
                }
              : {
                  uid: firebaseUser.uid,
                  displayName: firebaseUser.displayName || "User",
                  email: firebaseUser.email || "",
                  photoURL: firebaseUser.photoURL,
                  isGuest: false,
                }
          );
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
