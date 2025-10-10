'use client';

import Link from "next/link";
import { PlusCircle, Eye } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-2xl"
    >
      {/* Fondo con degradado */}
      <div className="absolute inset-0 bg-gradient-to-br from-acento-fuerte/10 via-acento-fuerte/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-acento-calido/5 to-acento-fuerte/10 opacity-50"></div>
      
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      
      <div className="relative z-10 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-acento-fuerte to-acento-calido bg-clip-text text-transparent">
              Bienvenido de nuevo, {user?.displayName?.split(' ')[0] || 'Usuario'}!
            </h1>
            <p className="text-foreground/80 mt-1">
              Aquí tienes un resumen de tus rifas y actividades.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => showUnderConstructionDialog('Ver Rifas Públicas')} className="items-center">
              <Eye className="mr-2 h-4 w-4 flex-shrink-0" /> Ver Rifas Públicas
            </Button>
            
            {canCreateRaffle && (
              <Button asChild className="items-center">
                <Link href="/raffle/create" className="flex items-center">
                  <PlusCircle className="mr-2 h-4 w-4 flex-shrink-0" /> Crear Rifa
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
