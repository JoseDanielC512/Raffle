'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isLoggingOut: boolean;
  setIsLoggingOut: (value: boolean) => void;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();
  
  // Use refs to track if operations are already in progress to prevent race conditions
  const authSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const isInitialLoadRef = useRef(true);

  // Function to handle logout to centralize the logic
  const logout = async () => {
    if (isLoggingOut) return; // Prevent multiple concurrent logout attempts
    
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
        variant: "info"
      });
    } catch (error) {
      toast({
        title: "Error al cerrar sesión",
        description: 'Ocurrió un problema al intentar cerrar la sesión. Por favor, intenta de nuevo.',
        variant: "destructive"
      });
      console.error('Logout error:', error);
    }
    // Note: We don't set isLoggingOut to false here because it will be handled by the auth state change listener
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only set loading to false after the initial load
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        setLoading(false);
      }
      
      // Update user and reset isLoggingOut when auth state changes
      setUser(user);
      setError(null);
      // Reset isLoggingOut when auth state changes (after logout, user will be null)
      if (isLoggingOut && !user) {
        setIsLoggingOut(false);
      }
    }, (error) => {
      const firebaseError = error as FirebaseError;
      setError(firebaseError.message);
      toast({
        title: "Error de Autenticación",
        description: firebaseError.message,
        variant: "destructive",
      });
      setLoading(false);
      setUser(null);
      // Ensure isLoggingOut is reset in case of error
      setIsLoggingOut(false);
    });

    authSubscriptionRef.current = { unsubscribe };
    
    // Cleanup subscription on unmount
    return () => {
      authSubscriptionRef.current?.unsubscribe();
    };
  }, [toast, isLoggingOut]);

  const value = { user, loading, error, isLoggingOut, setIsLoggingOut, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
