'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { useUnderConstructionContext } from '@/context/under-construction-context';

export function Header() {
  const [isClient, setIsClient] = useState(false);
  const { user, loading, isLoggingOut, logout, authStatus } = useAuth();
  const pathname = usePathname();
  const { showUnderConstructionDialog } = useUnderConstructionContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    logger.info('Header', 'logout clicked', { 
      pathname, 
      hasUser: !!user,
      userEmail: user?.email,
      authStatus 
    });
    
    try {
      await logout();
      logger.info('Header', 'logout function completed successfully');
    } catch (error) {
      logger.error('Header', 'logout function failed', error);
      console.error('Logout error:', error);
    }
  };
  
  // Hide header on auth pages
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname);

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-battleship_gray-100/95 backdrop-blur supports-[backdrop-filter]:bg-battleship_gray-100/60 px-4 sm:px-6 lg:px-8 ${isAuthPage ? 'hidden' : ''} dark:bg-battleship_gray-900/95 dark:supports-[backdrop-filter]:bg-battleship_gray-900/60`}>
      <div className="flex h-16 items-center justify-between">
        {/* Logo */}
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

        {/* Navigation content based on page type and auth status */}
        <div className="flex items-center gap-2">
          {isClient ? (
            <>
              {loading && (
                <div className="h-9 w-9 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-battleship_gray-600 dark:text-battleship_gray-400" />
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
                        <p className="text-xs leading-none text-battleship_gray-600 dark:text-battleship_gray-400">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Enlace original comentado - Mis Rifas
                    <DropdownMenuItem onClick={() => router.push('/my-raffles')} className="cursor-pointer">
                      <List className="mr-2 h-4 w-4" />
                      <span>Mis Rifas</span>
                    </DropdownMenuItem> */}
                    
                    <DropdownMenuItem onClick={() => showUnderConstructionDialog('Mis Rifas')} className="cursor-pointer">
                      <List className="mr-2 h-4 w-4" />
                      <span>Mis Rifas</span>
                    </DropdownMenuItem>
                    
                    {/* Enlace original comentado - Perfil
                    <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem> */}
                    
                    <DropdownMenuItem onClick={() => showUnderConstructionDialog('Perfil de Usuario')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    
                    {/* Enlace original comentado - Ajustes
                    <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ajustes</span>
                    </DropdownMenuItem> */}
                    
                    <DropdownMenuItem onClick={() => showUnderConstructionDialog('Ajustes y Configuración')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ajustes</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="cursor-pointer text-sage-500 focus:bg-sage-500 focus:text-sage-100"
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
                  <a href="/login" className="px-3 py-2 text-sm font-medium text-battleship_gray-600 dark:text-battleship_gray-400 hover:bg-tekhelet-500 hover:text-tekhelet-100 rounded-md">Iniciar Sesión</a>
                  <a href="/signup" className="px-3 py-2 text-sm font-medium bg-ultra_violet-500 text-ultra_violet-100 hover:bg-ultra_violet-500/90 rounded-md">Regístrate</a>
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
