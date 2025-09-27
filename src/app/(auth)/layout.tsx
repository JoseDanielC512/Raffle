'use client';

import { useAuth } from '@/context/auth-context';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ultra_violet-500 mx-auto"></div>
          <p className="mt-4 text-battleship_gray-600 dark:text-battleship_gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Render the login/signup forms only if the user is unauthenticated.
  return (
    <main className="flex items-center justify-center h-screen p-4">
      {children}
    </main>
  );
}
