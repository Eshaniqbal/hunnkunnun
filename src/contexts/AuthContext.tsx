
"use client";

import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import type { ReactNode} from "react";
import { createContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import type { UserProfile } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthContextType {
  currentUser: UserProfile | null | undefined; // undefined means loading, null means no user
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: undefined,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          metadata: user.metadata,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handled initial loading state via currentUser === undefined
  // to prevent flash of unauthenticated content or unnecessary full page skeleton
  // Children are rendered once auth state is determined (null or UserProfile)
  // The main layout skeleton for initial page load is handled by Next.js server rendering and suspense if used.

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {currentUser === undefined && loading ? (
         <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-xl">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin text-primary">
                    <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4.93005 4.93005L7.76005 7.76005" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4.93005 19.07L7.76005 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.24 7.76005L19.07 4.93005" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-lg font-medium text-foreground">Initializing Kashmir Classifieds...</p>
                <p className="text-sm text-muted-foreground">Please wait a moment.</p>
            </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
