import type { Raffle, RaffleSlot as RaffleSlotType } from "@/lib/definitions";
import RaffleSlot from "./raffle-slot";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

type RaffleBoardProps = {
  raffle: Raffle;
  slots: RaffleSlotType[]; // Accept slots as a separate prop
};

export default function RaffleBoard({ raffle, slots }: RaffleBoardProps) {
  const availableSlots = slots.filter(slot => slot.status === 'available').length;
  const reservedSlots = slots.filter(slot => slot.status === 'reserved').length;
  const paidSlots = slots.filter(slot => slot.status === 'paid').length;

  return (
    <Card className="bg-gradient-to-br from-background to-muted/10 border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold font-headline text-foreground">
              Tablero de Rifas
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              {raffle.name} - Progreso: {paidSlots + reservedSlots}/100
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Disponibles: {availableSlots}
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Reservadas: {reservedSlots}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Pagadas: {paidSlots}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-10 gap-1 md:gap-2 max-w-2xl mx-auto">
          {slots.map((slot) => (
            <RaffleSlot
              key={slot.slotNumber}
              slot={slot}
              raffleId={raffle.id}
              isWinner={raffle.winnerSlotNumber === slot.slotNumber}
              isFinalized={!!raffle.finalizedAt}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center gap-6 mt-6 pt-4 border-t border-muted">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-sm shadow-sm"></div>
            <span className="text-sm text-muted-foreground">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-sm shadow-sm"></div>
            <span className="text-sm text-muted-foreground">Reservada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-sm shadow-sm"></div>
            <span className="text-sm text-muted-foreground">Pagada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-400 rounded-sm shadow-sm"></div>
            <span className="text-sm text-muted-foreground">Ganadora</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
