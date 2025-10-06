'use client';

import { useAuth } from '@/context/auth-context';
import { Header } from '@/components/layout/header';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authStatus, loading } = useAuth();

  // Show a loading spinner while auth status is being determined.
  // The AuthNavigationHandler will redirect away if the user is already authenticated.
  if (loading || authStatus === 'checking' || authStatus === 'authenticated') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acento-fuerte mx-auto"></div>
          <p className="mt-4 text-primario-oscuro/60">Cargando...</p>
        </div>
      </div>
    );
  }

  // Render the login/signup forms only if the user is unauthenticated.
  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 auth-pattern-bg z-0" />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header showAuthButtons={false} />
        <main className="flex items-center justify-center flex-1 p-4 auth-pattern-content">
          {children}
        </main>
      </div>
    </div>
  );
}
