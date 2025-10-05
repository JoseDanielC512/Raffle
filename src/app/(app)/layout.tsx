'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/layout/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { authStatus, loading } = useAuth();
  const pathname = usePathname();

  // Determine if the current page is a raffle detail page using a regex.
  // This ensures that only pages with a raffle ID (e.g., /raffle/someId123)
  // get the immersive layout, excluding pages like /raffle/create.
  const raffleDetailPageRegex = /^\/raffle\/[a-zA-Z0-9]{20,}$/;
  const isRafflePage = raffleDetailPageRegex.test(pathname);

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
    // If it's the raffle detail page, render children directly without padding or extra divs
    // to allow for an immersive, full-screen experience.
    if (isRafflePage) {
      return <>{children}</>;
    }

    // For all other authenticated pages (like the dashboard), use the standard layout with padding.
    return (
      <div className="flex flex-col w-full h-full">
        <Header />
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
