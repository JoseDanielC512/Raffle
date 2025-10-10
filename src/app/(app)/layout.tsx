'use client';

import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/layout/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { authStatus, loading } = useAuth();

  // Show a loading spinner while checking authentication status
  if (loading || authStatus === 'checking') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acento-fuerte mx-auto"></div>
          <p className="mt-4 text-primario-oscuro/60">Cargando...</p>
        </div>
      </div>
    );
  }

  // If the user is authenticated, render the protected layout with its children.
  if (authStatus === 'authenticated') {
    // For all authenticated pages, use the standard layout with padding
    return (
      <div className="min-h-screen flex flex-col">
        <div className="fixed inset-0 home-pattern-bg z-0" />
        <div className="relative z-10 min-h-screen flex flex-col home-pattern-content">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // If the user is not authenticated, render nothing.
  // The AuthNavigationHandler will manage the redirection to the login page.
  return null;
}
