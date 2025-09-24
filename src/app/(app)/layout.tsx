'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated and not loading, redirect to login
    if (!loading && !user && !isLoggingOut) {
      router.replace('/login');
    }
  }, [user, loading, router, isLoggingOut]);

  // Show loading state when loading
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Only render the layout if user is authenticated
  if (user) {
    return (
      <div className="flex flex-col min-h-screen w-full">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    );
  }

  // If user is not authenticated and not loading, return null to let the redirect happen
  return null;
}
