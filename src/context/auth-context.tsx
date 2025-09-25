'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Define the new shape of the context
type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  loading: boolean; // Kept for initial page load
  isLoggingOut: boolean; // Kept for UI feedback (e.g., disabling buttons)
  authStatus: AuthStatus;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const { toast } = useToast();

  // The logout function now only needs to set the isLoggingOut flag and call signOut.
  // The onAuthStateChanged listener will handle the rest.
  const logout = useCallback(async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    setIsLoggingOut(true);
    try {
      await signOut(auth);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
        variant: "info",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error al cerrar sesión",
        description: 'Ocurrió un problema al intentar cerrar la sesión. Por favor, intenta de nuevo.',
        variant: "destructive",
      });
      // If logout fails, reset the flag
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, toast]);

  // This useEffect handles the Firebase auth state subscription.
  // It runs only once on mount.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthStatus('authenticated');
      } else {
        setUser(null);
        setAuthStatus('unauthenticated');
      }
      setLoading(false); // Mark initial loading as complete
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // This useEffect resets the isLoggingOut flag once the authStatus confirms logout.
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      setIsLoggingOut(false);
    }
  }, [authStatus]);

  // The value provided to consumers.
  // We no longer export setIsLoggingOut to improve encapsulation.
  const value = { user, loading, isLoggingOut, authStatus, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
