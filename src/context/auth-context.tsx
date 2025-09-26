'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { useLogoutCoordination } from '@/context/logout-coordination-context';
import { SessionTimeoutDialog } from '@/components/auth/session-timeout-dialog';

// Define the new shape of the context
type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  loading: boolean; // Kept for initial page load
  isLoggingOut: boolean; // Kept for UI feedback (e.g., disabling buttons)
  authStatus: AuthStatus;
  logout: () => Promise<void>;
  resetInactivityTimer: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TIMEOUT_MINUTES = 15;
const WARNING_COUNTDOWN_SECONDS = 60;

// Create the provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { setManualLogoutInProgress } = useLogoutCoordination();
  const activityTimerRef = useRef<NodeJS.Timeout>();

  const logout = useCallback(async () => {
    logger.info('AuthContext', 'logout initiated', { 
      isLoggingOut, 
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      currentAuthStatus: authStatus 
    });
    
    if (isLoggingOut) {
      logger.warn('AuthContext', 'logout already in progress, skipping');
      return;
    }

    setManualLogoutInProgress(true);
    setIsLoggingOut(true);
    
    try {
      logger.info('AuthContext', 'calling signOut');
      await signOut(auth);
      logger.info('AuthContext', 'signOut successful');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
        variant: "info",
      });
      
      logger.info('AuthContext', 'redirecting to home page');
      router.push('/');
      
      setTimeout(() => {
        logger.info('AuthContext', 'resetting manual logout progress flag');
        setManualLogoutInProgress(false);
      }, 500);
      
    } catch (error) {
      logger.error('AuthContext', 'logout failed', error, { isLoggingOut });
      console.error('Logout error:', error);
      toast({
        title: "Error al cerrar sesión",
        description: 'Ocurrió un problema al intentar cerrar la sesión. Por favor, intenta de nuevo.',
        variant: "destructive",
      });
      setIsLoggingOut(false);
      setManualLogoutInProgress(false);
    }
  }, [isLoggingOut, toast, router, authStatus, setManualLogoutInProgress]);

  const resetTimer = useCallback(() => {
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    activityTimerRef.current = setTimeout(() => {
      if (authStatus === 'authenticated') {
        setShowTimeoutWarning(true);
      }
    }, TIMEOUT_MINUTES * 60 * 1000);
  }, [authStatus]);

  const resetInactivityTimer = useCallback(() => {
    setShowTimeoutWarning(false);
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      logger.info('AuthContext', 'auth state changed', { 
        hasUser: !!currentUser, 
        email: currentUser?.email,
        uid: currentUser?.uid,
        newStatus: currentUser ? 'authenticated' : 'unauthenticated',
        previousStatus: authStatus
      });
      
      if (currentUser) {
        setUser(currentUser);
        setAuthStatus('authenticated');
      } else {
        setUser(null);
        setAuthStatus('unauthenticated');
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      setIsLoggingOut(false);
    }
  }, [authStatus, setIsLoggingOut]);

  useEffect(() => {
    const handleActivity = () => {
      resetTimer();
    };

    if (authStatus === 'authenticated') {
      const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, handleActivity));
      resetTimer();

      return () => {
        events.forEach(event => window.removeEventListener(event, handleActivity));
        if (activityTimerRef.current) {
          clearTimeout(activityTimerRef.current);
        }
      };
    }
  }, [authStatus, resetTimer]);

  const value = { user, loading, isLoggingOut, authStatus, logout, resetInactivityTimer };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionTimeoutDialog
        open={showTimeoutWarning}
        onOpenChange={setShowTimeoutWarning}
        onStay={resetInactivityTimer}
        countdownSeconds={WARNING_COUNTDOWN_SECONDS}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
