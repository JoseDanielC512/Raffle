'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { UnderConstructionDialog } from '@/components/ui/under-construction-dialog';

interface RouteConfig {
  path: string;
  featureName: string;
  exact?: boolean;
}

// Lista de rutas que están referenciadas pero no implementadas
const UNIMPLEMENTED_ROUTES: RouteConfig[] = [
  { path: '/my-raffles', featureName: 'Mis Rifas', exact: true },
  { path: '/public-raffles', featureName: 'Ver Rifas Públicas', exact: true },
  { path: '/profile', featureName: 'Perfil de Usuario', exact: true },
  { path: '/settings', featureName: 'Ajustes y Configuración', exact: true },
  { path: '/terms', featureName: 'Términos y Condiciones', exact: true },
];

// Lista de rutas que sí existen para evitar falsos positivos
const EXISTING_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/dashboard',
  '/raffle/create',
  '/public/raffle/[raffleId]',
];

export function useUnderConstruction() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string>('esta funcionalidad');
  const pathname = usePathname();

  const checkIfRouteExists = (path: string): boolean => {
    // Verificar si es una ruta dinámica existente
    if (path.startsWith('/raffle/') && path.split('/').length === 3) {
      return true; // Ruta /raffle/[id] existe
    }
    
    if (path.startsWith('/public/raffle/') && path.split('/').length === 4) {
      return true; // Ruta /public/raffle/[raffleId] existe
    }

    // Verificar rutas exactas existentes
    return EXISTING_ROUTES.some(existingRoute => {
      if (existingRoute.includes('[') && existingRoute.includes(']')) {
        // Es una ruta dinámica, verificar el patrón
        const routePattern = existingRoute.replace(/\[.*?\]/g, '[^/]+');
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(path);
      }
      return existingRoute === path;
    });
  };

  const findUnimplementedRoute = (path: string): RouteConfig | null => {
    return UNIMPLEMENTED_ROUTES.find(route => {
      if (route.exact) {
        return path === route.path;
      }
      return path.startsWith(route.path);
    }) || null;
  };

  // Función para mostrar el diálogo manualmente (sin navegación)
  const showUnderConstructionDialog = (featureName: string) => {
    setCurrentFeature(featureName);
    setIsDialogOpen(true);
  };

  // Función para cerrar el diálogo (sin redirección)
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Ya no redirigimos automáticamente, mantenemos al usuario en la página actual
  };

  // Efecto para detectar rutas no implementadas (como respaldo)
  useEffect(() => {
    // Solo activar la detección automática si el diálogo no está abierto manualmente
    if (!isDialogOpen && !checkIfRouteExists(pathname)) {
      const unimplementedRoute = findUnimplementedRoute(pathname);
      
      if (unimplementedRoute) {
        showUnderConstructionDialog(unimplementedRoute.featureName);
      } else {
        // Si no está en la lista de rutas no implementadas pero no existe,
        // mostrar un mensaje genérico solo si es una ruta que parece legítima
        if (pathname.startsWith('/') && pathname !== '/') {
          showUnderConstructionDialog('esta página');
        }
      }
    }
  }, [pathname, isDialogOpen]);

  const UnderConstructionComponent = () => (
    <UnderConstructionDialog
      isOpen={isDialogOpen}
      onClose={handleDialogClose}
      featureName={currentFeature}
    />
  );

  return {
    UnderConstructionComponent,
    showUnderConstructionDialog,
    isDialogOpen,
  };
}
