'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { CircleUser, Loader2, List, User, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isClient, setIsClient] = useState(false);
  const { user, loading, isLoggingOut, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    // The navigation logic is now handled by the AuthNavigationHandler.
    // This function is now only responsible for initiating the logout process.
    try {
      await logout();
    } catch (error) {
      // The auth context will handle resetting the isLoggingOut state on error,
      // but we can still log the error here.
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        {/* Logo y navegación desktop */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center transition-transform hover:scale-105">
            <Image 
              src="/static/logo.png" 
              alt="Lucky 100 Logo" 
              width={80} 
              height={80} 
              className="w-auto h-auto max-h-[60px]"
            />
          </Link>
        </div>

        {/* Usuario/autenticación */}
        <div className="flex items-center gap-2">
          {isClient ? (
            <>
              {loading && (
                <div className="h-9 w-9 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!loading && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <CircleUser className="h-5 w-5" />
                      <span className="sr-only">Menú de usuario</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'Usuario'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/my-raffles')} className="cursor-pointer">
                      <List className="mr-2 h-4 w-4" />
                      <span>Mis Rifas</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ajustes</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    >
                      {isLoggingOut ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cerrando sesión...
                        </>
                      ) : (
                        'Cerrar Sesión'
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {!loading && !user && (
                <div className="flex items-center gap-2">
                  <a href="/login" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md">Iniciar Sesión</a>
                  <a href="/signup" className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">Regístrate</a>
                </div>
              )}
            </>
          ) : (
            <div className="h-9 w-9" /> // Placeholder
          )}
        </div>
      </div>
    </header>
  );
}
