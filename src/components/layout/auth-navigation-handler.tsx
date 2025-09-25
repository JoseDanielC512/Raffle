'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

// Define route categories for clarity
const PROTECTED_ROUTE_PREFIXES = ['/dashboard', '/raffle', '/profile', '/settings', '/my-raffles'];
const PUBLIC_ONLY_ROUTES = ['/login', '/signup', '/forgot-password', '/'];

export function AuthNavigationHandler() {
  const { authStatus, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until the initial authentication check is complete before applying navigation rules.
    if (loading || authStatus === 'checking') {
      return;
    }

    const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix));
    const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.includes(pathname);

    // --- Redirection logic for authenticated users ---
    if (authStatus === 'authenticated') {
      // If an authenticated user is on a page that should only be seen by unauthenticated users (e.g., login, signup, landing page),
      // redirect them to their main dashboard.
      if (isPublicOnlyRoute) {
        router.replace('/dashboard');
      }
    }
    // --- Redirection logic for unauthenticated users ---
    else if (authStatus === 'unauthenticated') {
      // If an unauthenticated user tries to access a protected route,
      // redirect them to the login page.
      if (isProtectedRoute) {
        router.replace('/login');
      }
    }
  }, [authStatus, loading, pathname, router]);

  // This component's purpose is to handle side effects, so it renders nothing.
  return null;
}
