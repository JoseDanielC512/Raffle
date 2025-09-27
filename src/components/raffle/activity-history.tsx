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
        return <Calendar className="h-4 w-4 text-ultra_violet-500" />;
      case 'slot_updated':
        return <Ticket className="h-4 w-4 text-sage-500" />;
      case 'raffle_finalized':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'raffle_updated':
        return <User className="h-4 w-4 text-tekhelet-500" />;
      default:
        return <Clock className="h-4 w-4 text-battleship_gray-500" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'raffle_created':
        return 'bg-ultra_violet-500/10 text-ultra_violet-700 border-ultra_violet-500/30';
      case 'slot_updated':
        return 'bg-sage-500/10 text-sage-700 border-sage-500/30';
      case 'raffle_finalized':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30';
      case 'raffle_updated':
        return 'bg-tekhelet-500/10 text-tekhelet-700 border-tekhelet-500/30';
      default:
        return 'bg-battleship_gray-500/10 text-battleship_gray-700 border-battleship_gray-500/30';
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
    <Card className="bg-gradient-to-br from-battleship_gray-100/10 via-battleship_gray-100/5 to-battleship_gray-100/10 backdrop-blur-lg border-battleship_gray-100/20 shadow-2xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-tekhelet-600/20 to-ultra_violet-600/20 border-b border-battleship_gray-100/10">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-tekhelet-300" />
          <CardTitle className="text-xl font-bold text-battleship_gray-100 drop-shadow-lg">
            Historial de Actividad
          </CardTitle>
        </div>
        <p className="text-tekhelet-100 text-sm font-light drop-shadow mt-1">
          Registro de todas las acciones realizadas en esta rifa
        </p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {sortedActivities.length === 0 ? (
          <div className="text-center py-6 text-battleship_gray-600 dark:text-battleship_gray-400">
            <p>No hay actividad registrada aún.</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {sortedActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-battleship_gray-100/5 backdrop-blur-sm border border-battleship_gray-100/10"
                >
                  <div className="mt-1">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Badge className={getActivityColor(activity.action)} variant="secondary">
                        {activity.action.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-battleship_gray-600 dark:text-battleship_gray-400">
                        {format(new Date(activity.timestamp), "dd/MM/yyyy HH:mm", { locale: es })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground">
                      {getActivityMessage(activity)}
                    </p>
                    {activity.details.slotNumber && (
                      <div className="mt-1 text-xs text-battleship_gray-600 dark:text-battleship_gray-400">
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