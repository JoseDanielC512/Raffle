'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useLogoutCoordination } from '@/context/logout-coordination-context';
import { logger } from '@/lib/logger';

// Define route categories for clarity
const PROTECTED_ROUTE_PREFIXES = ['/dashboard', '/raffle', '/profile', '/settings', '/my-raffles'];
const PUBLIC_ONLY_ROUTES = ['/login', '/signup', '/forgot-password']; // Eliminamos '/' para evitar conflicto con logout

export function AuthNavigationHandler() {
  const { authStatus, loading } = useAuth();
  const { isManualLogoutInProgress } = useLogoutCoordination();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If manual logout is in progress, skip all navigation logic
    if (isManualLogoutInProgress) {
      logger.info('AuthNavigationHandler', 'manual logout in progress, skipping navigation logic');
      return;
    }

    // Wait until the initial authentication check is complete before applying navigation rules.
    if (loading || authStatus === 'checking') {
      return;
    }

    const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix));
    const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.includes(pathname);

    // Special case: Redirect authenticated users from home page to dashboard
    if (pathname === '/') {
      if (authStatus === 'authenticated') {
        router.replace('/dashboard');
        return;
      } else {
        return;
      }
    }

    // --- Redirection logic for authenticated users ---
    if (authStatus === 'authenticated') {
      // If an authenticated user is on a page that should only be seen by unauthenticated users (e.g., login, signup, landing page),
      // redirect them to their main dashboard.
      if (isPublicOnlyRoute) {
        logger.info('AuthNavigationHandler', 'redirecting authenticated user from public page', { 
          from: pathname, 
          to: '/dashboard',
          reason: 'authenticated user on public-only route'
        });
        router.replace('/dashboard');
      }
    }
    // --- Redirection logic for unauthenticated users ---
    else if (authStatus === 'unauthenticated') {
      // If an unauthenticated user tries to access a protected route,
      // redirect them to the login page.
      if (isProtectedRoute) {
        logger.info('AuthNavigationHandler', 'redirecting unauthenticated user from protected page', { 
          from: pathname, 
          to: '/login',
          reason: 'unauthenticated user on protected route'
        });
        router.replace('/login');
      }
    }
  }, [authStatus, loading, pathname, router, isManualLogoutInProgress]);

  // This component's purpose is to handle side effects, so it renders nothing.
  return null;
}
