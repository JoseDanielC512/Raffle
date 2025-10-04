'use client';

import { RaffleActivity } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Ticket, Trophy, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type ActivityHistoryProps = {
  activities: RaffleActivity[];
};

export default function ActivityHistory({ activities }: ActivityHistoryProps) {
  // Sort activities by timestamp (most recent first)
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'raffle_created':
        return <Calendar className="h-4 w-4 text-acento-fuerte" />;
      case 'slot_updated':
        return <Ticket className="h-4 w-4 text-slot-reserved" />;
      case 'raffle_finalized':
        return <Trophy className="h-4 w-4 text-slot-winning" />;
      case 'raffle_updated':
        return <User className="h-4 w-4 text-acento-calido" />;
      default:
        return <Clock className="h-4 w-4 text-primario-oscuro/50" />;
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

  return (
    <Card className="bg-gradient-to-br from-fondo-base/10 via-fondo-base/5 to-fondo-base/10 backdrop-blur-lg border-border/20 shadow-2xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-acento-fuerte/20 to-acento-calido/20 border-b border-border/10">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-white/80" />
          <CardTitle className="text-xl font-bold text-primario-oscuro drop-shadow-lg">
            Historial de Actividad
          </CardTitle>
        </div>
        <p className="text-white/70 text-sm font-light drop-shadow mt-1">
          Registro de todas las acciones realizadas en esta rifa
        </p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {sortedActivities.length === 0 ? (
          <div className="text-center py-6 text-primario-oscuro/60">
            <p>No hay actividad registrada aún.</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {sortedActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-fondo-base/20 backdrop-blur-sm border border-border/10"
                >
                  <div className="mt-1">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Badge className={getActivityColor(activity.action)} variant="secondary">
                        {activity.action.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-primario-oscuro/60">
                        {format(new Date(activity.timestamp), "dd/MM/yyyy HH:mm", { locale: es })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground">
                      {getActivityMessage(activity)}
                    </p>
                    {activity.details.slotNumber && (
                      <div className="mt-1 text-xs text-primario-oscuro/60">
                        Casilla: {activity.details.slotNumber}
                        {activity.details.previousStatus && activity.details.newStatus && (
                          <>
                            {' '}
                            <span className="font-medium">
                              ({activity.details.previousStatus} → {activity.details.newStatus})
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
