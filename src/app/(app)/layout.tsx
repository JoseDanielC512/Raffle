'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se verifica la autenticación
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

  // Si no hay usuario autenticado, no mostrar el contenido de la aplicación
  // El useEffect se encargará de redirigir automáticamente
  if (!user) {
    return null;
  }

  // Solo mostrar el contenido de la aplicación si el usuario está autenticado
  return <div className="p-4 md:gap-8 md:p-8">{children}</div>;
}
