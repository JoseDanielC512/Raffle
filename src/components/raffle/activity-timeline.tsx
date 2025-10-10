'use client';

import { useState, useMemo } from 'react';
import { RaffleActivity } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  User, 
  Ticket, 
  Trophy, 
  Calendar, 
  Filter,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type ActivityTimelineProps = {
  activities: RaffleActivity[];
  loading?: boolean;
};

// Definición de filtros
const activityFilters = [
  {
    id: 'all',
    label: 'Todas',
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-primario-oscuro/10 text-primario-oscuro border-primario-oscuro/30'
  },
  {
    id: 'raffle_created',
    label: 'Creada',
    icon: <Calendar className="h-4 w-4" />,
    color: 'bg-acento-fuerte/10 text-acento-fuerte border-acento-fuerte/30'
  },
  {
    id: 'raffle_updated',
    label: 'Actualizada',
    icon: <User className="h-4 w-4" />,
    color: 'bg-acento-calido/10 text-acento-calido border-acento-calido/30'
  },
  {
    id: 'slot_updated',
    label: 'Casillas',
    icon: <Ticket className="h-4 w-4" />,
    color: 'bg-slot-reserved/10 text-slot-reserved border-slot-reserved/30'
  },
  {
    id: 'raffle_finalized',
    label: 'Finalizada',
    icon: <Trophy className="h-4 w-4" />,
    color: 'bg-slot-winning/10 text-slot-winning border-slot-winning/30'
  }
];

export default function ActivityTimeline({ activities, loading = false }: ActivityTimelineProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Contador de actividades por tipo
  const activityCounts = useMemo(() => {
    const counts = activityFilters.reduce((acc, filter) => {
      acc[filter.id] = 0;
      return acc;
    }, {} as Record<string, number>);

    activities.forEach(activity => {
      counts[activity.action] = (counts[activity.action] || 0) + 1;
      counts['all'] += 1;
    });

    return counts;
  }, [activities]);

  // Actividades filtradas
  const filteredActivities = useMemo(() => {
    if (selectedFilter === 'all') {
      return activities;
    }
    return activities.filter(activity => activity.action === selectedFilter);
  }, [activities, selectedFilter]);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'raffle_created':
        return <Calendar className="h-5 w-5 text-acento-fuerte" />;
      case 'slot_updated':
        return <Ticket className="h-5 w-5 text-slot-reserved" />;
      case 'raffle_finalized':
        return <Trophy className="h-5 w-5 text-slot-winning" />;
      case 'raffle_updated':
        return <User className="h-5 w-5 text-acento-calido" />;
      default:
        return <Clock className="h-5 w-5 text-primario-oscuro/50" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'raffle_created':
        return 'bg-acento-fuerte/10 text-acento-fuerte/80 border-acento-fuerte/30';
      case 'slot_updated':
        return 'bg-slot-reserved/10 text-slot-reserved/80 border-slot-reserved/30';
      case 'raffle_finalized':
        return 'bg-slot-winning/10 text-slot-winning/80 border-slot-winning/30';
      case 'raffle_updated':
        return 'bg-acento-calido/10 text-acento-calido/80 border-acento-calido/30';
      default:
        return 'bg-primario-oscuro/10 text-primario-oscuro/70 border-primario-oscuro/30';
    }
  };

  const getActivityMessage = (activity: RaffleActivity) => {
    switch (activity.action) {
      case 'raffle_created':
        return activity.details.message || 'Rifa creada exitosamente';
      case 'slot_updated':
        return activity.details.message || `Casilla ${activity.details.slotNumber} actualizada`;
      case 'raffle_finalized':
        return activity.details.message || `Rifa finalizada. Casilla ganadora: ${activity.details.winnerSlotNumber}`;
      case 'raffle_updated':
        return activity.details.message || 'Rifa actualizada';
      default:
        return activity.details.message || 'Acción desconocida';
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/60 shadow-lg rounded-2xl">
        <CardHeader className="relative overflow-hidden rounded-t-2xl border-b-transparent pb-4 bg-gradient-to-r from-primario-oscuro/90 via-primario-oscuro/80 to-acento-calido/90 p-6 text-white">
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-white">
                Historial de Actividad
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Filtros Skeleton */}
            <div className="flex flex-wrap gap-2 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-20 rounded-full" />
              ))}
            </div>
            
            {/* Timeline Skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-2/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primario-oscuro/10 via-primario-oscuro/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-acento-calido/5 to-primario-oscuro/10 opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      
      <Card className="relative z-10 bg-card/80 backdrop-blur-sm !border !border-border shadow-lg rounded-2xl">
        <CardHeader className="relative overflow-hidden rounded-t-2xl border-b-transparent pb-4 bg-gradient-to-r from-primario-oscuro/90 via-primario-oscuro/80 to-acento-calido/90 p-6 text-white">
          {/* Efecto de brillo sutil */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-acento-calido/5 to-primario-oscuro/10 opacity-30"></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-white">
                Historial de Actividad
              </CardTitle>
            </div>
            <div className="relative z-20">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {activityCounts['all']} actividades
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Filtros */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primario-oscuro/70" />
                <span className="text-sm font-medium text-primario-oscuro/70">Filtrar por tipo:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {activityFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 border",
                      selectedFilter === filter.id
                        ? filter.color
                        : "bg-muted/50 text-muted-foreground hover:bg-muted border-border/50"
                    )}
                  >
                    {filter.icon}
                    <span>{filter.label}</span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "ml-1 px-1.5 py-0 text-xs",
                        selectedFilter === filter.id 
                          ? "bg-background/20 text-current" 
                          : "bg-background/50"
                      )}
                    >
                      {activityCounts[filter.id]}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {filteredActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/20 rounded-full mb-4">
                  <Info className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  {selectedFilter === 'all' 
                    ? 'No hay actividad registrada aún.' 
                    : `No hay actividades del tipo "${activityFilters.find(f => f.id === selectedFilter)?.label}".`
                  }
                </p>
              </motion.div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="relative">
                  {/* Línea central del timeline */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border/30"></div>
                  
                  <div className="space-y-6">
                    <AnimatePresence>
                      {filteredActivities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="relative flex gap-4"
                        >
                          {/* Círculo del timeline */}
                          <div className="relative z-10 flex-shrink-0">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center border-2",
                              getActivityColor(activity.action)
                            )}>
                              {getActivityIcon(activity.action)}
                            </div>
                            
                            {/* Indicador de estado */}
                            {activity.action === 'raffle_finalized' && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                                className="absolute -top-1 -right-1 w-3 h-3 bg-slot-winning rounded-full border-2 border-background"
                              />
                            )}
                          </div>
                          
                          {/* Contenido de la actividad */}
                          <div className="flex-1 min-w-0 pb-2">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Badge className={getActivityColor(activity.action).replace('border-', '').replace('/10', '/20').replace('/20', '/30')}>
                                {activity.action.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <span className="text-xs text-primario-oscuro/60 whitespace-nowrap">
                                {format(new Date(activity.timestamp), "dd/MM/yyyy HH:mm", { locale: es })}
                              </span>
                            </div>
                            
                            <div className="bg-muted/20 rounded-lg p-3 border border-border/20">
                              <p className="text-sm text-foreground mb-2">
                                {getActivityMessage(activity)}
                              </p>
                              
                              {activity.details.slotNumber && (
                                <div className="flex items-center gap-2 text-xs text-primario-oscuro/60">
                                  <Ticket className="h-3 w-3" />
                                  <span>Casilla: {activity.details.slotNumber}</span>
                                  {activity.details.previousStatus && activity.details.newStatus && (
                                    <>
                                      <span>•</span>
                                      <span className="font-medium">
                                        {activity.details.previousStatus} → {activity.details.newStatus}
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                              
                              {activity.details.winnerSlotNumber && (
                                <div className="flex items-center gap-2 text-xs text-slot-winning mt-2">
                                  <Trophy className="h-3 w-3" />
                                  <span>Casilla ganadora: #{activity.details.winnerSlotNumber}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
