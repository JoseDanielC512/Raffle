'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // No redirigir mientras el proceso de logout está en curso.
    if (isLoggingOut) {
      return;
    }

    // Redirigir solo si la carga ha terminado y no hay usuario.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router, isLoggingOut]);

  // Mostrar loading mientras se verifica la autenticación o se cierra sesión.
  if (loading || isLoggingOut) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{isLoggingOut ? 'Cerrando sesión...' : 'Cargando...'}</p>
        </div>
      </div>
    );
  }

  // Si hay un usuario, mostrar el contenido de la aplicación.
  // Si no hay usuario pero aún está cargando, el bloque anterior se encarga.
  // Si no hay usuario y no está cargando, el useEffect ya habrá iniciado la redirección.
  if (user) {
    return <div className="p-4 md:gap-8 md:p-8">{children}</div>;
  }

  // Mientras se redirige, no renderizar nada.
  return null;
}
