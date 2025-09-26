'use client';

import Link from "next/link";
import { PlusCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useUnderConstructionContext } from "@/context/under-construction-context";

interface DashboardHeaderProps {
  canCreateRaffle: boolean;
}

export function DashboardHeader({ canCreateRaffle }: DashboardHeaderProps) {
  const { user } = useAuth();
  const { showUnderConstructionDialog } = useUnderConstructionContext();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Bienvenido de nuevo, {user?.displayName?.split(' ')[0] || 'Usuario'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Aquí tienes un resumen de tus rifas y actividades.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {/* Enlace original comentado - Ver Rifas Públicas
        <Button variant="outline" asChild>
          <Link href="/public-raffles"> 
            <Eye className="mr-2 h-4 w-4" /> Ver Rifas Públicas
          </Link>
        </Button> */}
        
        <Button variant="outline" onClick={() => showUnderConstructionDialog('Ver Rifas Públicas')}>
          <Eye className="mr-2 h-4 w-4" /> Ver Rifas Públicas
        </Button>
        
        {canCreateRaffle && (
          <Button asChild>
            <Link href="/raffle/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Crear Rifa
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
