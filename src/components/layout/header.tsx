'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CircleUser, Menu, Package2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader } from '@/components/ui/sheet';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user, loading, isLoggingOut, setIsLoggingOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente."
      });
      router.push('/');
    } catch (error) {
      console.error('Error en logout:', error);
      toast({
        title: "Error",
        description: 'Error al cerrar sesión. Intenta de nuevo.',
        variant: "destructive"
      });
      setIsLoggingOut(false);
    }
  };

  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Package2 },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard', icon: undefined }] : []),
  ];

  // Si el usuario está autenticado, no mostrar enlaces de login/signup en el header
  // ya que serán redirigidos automáticamente por los layouts
  const showAuthLinks = !user && !loading;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo y navegación desktop */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package2 className="h-5 w-5" />
            </div>
            <span className="hidden font-bold sm:inline-block lg:text-xl">Lucky 100 Raffle</span>
          </Link>
          
          {/* Navegación desktop */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                  isActiveLink(link.href) 
                    ? "bg-accent text-accent-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={`Navegar a ${link.label}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Menú móvil */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="h-9 w-9 p-0 md:flex md:items-center md:justify-center">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Package2 className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg">Lucky 100 Raffle</span>
              </div>
            </SheetHeader>
            <nav className="grid gap-4 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                    isActiveLink(link.href) 
                      ? "bg-accent text-accent-foreground shadow-sm" 
                      : "text-muted-foreground"
                  )}
                  aria-label={`Navegar a ${link.label}`}
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Usuario/autenticación */}
        <div className="flex items-center gap-2">
          {loading && (
            <div className="h-9 w-9 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-9 w-9 rounded-full flex items-center justify-center">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Menú de usuario</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'Usuario'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => { /* TODO: Navigate to settings */ }}
                  className="cursor-pointer"
                >
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
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
          {showAuthLinks && (
            <div className="flex items-center gap-2">
              <a href="/login" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md">Iniciar Sesión</a>
              <a href="/signup" className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">Regístrate</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
