'use client';

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function StatCard({ title, value, description, icon, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border border-border/60 shadow-lg rounded-2xl h-[140px]">
        {/* Fondo con degradado base igual que el componente real */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-acento-calido/5 to-acento-fuerte/10 opacity-50"></div>
        
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <div>
            <Skeleton className="h-8 w-16 rounded mb-1" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-2xl h-[140px]"
    >
      {/* Fondo con degradado */}
      <div className="absolute inset-0 bg-gradient-to-br from-acento-fuerte/10 via-acento-fuerte/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-acento-calido/5 to-acento-fuerte/10 opacity-50"></div>
      
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      
      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-sm font-bold text-muted-foreground">{title}</h3>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
