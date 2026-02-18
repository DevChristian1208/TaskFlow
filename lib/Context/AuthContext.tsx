"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase";

export type AppUser = {
  uid: string;
  displayName: string;
  email?: string;
  isGuest?: boolean;
};

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  setGuestUser: (guestId: string) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setGuestUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  function setGuestUser(guestId: string) {
    setUser({
      uid: guestId,
      displayName: "Gast",
      isGuest: true,
    });
  }

  useEffect(() => {
    const guestId = localStorage.getItem("guestId");

    if (guestId) {
      setGuestUser(guestId);
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(
      auth,
      (firebaseUser: FirebaseUser | null) => {
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          isGuest: false,
        });

        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setGuestUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
