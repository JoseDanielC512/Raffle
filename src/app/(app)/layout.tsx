'use client';

import { useAuth } from "@/context/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { authStatus, loading } = useAuth();

  // Show a loading spinner while checking authentication status
  if (loading || authStatus === 'checking') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // If the user is authenticated, render the protected layout with its children.
  // The Header is now handled by the universal header in the root layout.
  if (authStatus === 'authenticated') {
    return (
      <div className="flex flex-col w-full h-full">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  // If the user is not authenticated, render nothing.
  // The AuthNavigationHandler will manage the redirection to the login page.
  return null;
}
