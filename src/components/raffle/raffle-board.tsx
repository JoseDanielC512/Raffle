import type { Raffle, RaffleSlot as RaffleSlotType } from "@/lib/definitions";
import RaffleSlot from "./raffle-slot";
import StatusLegend from "./StatusLegend";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { triggerSlotConfetti } from "@/lib/utils";

type RaffleBoardProps = {
  raffle: Raffle;
  slots: RaffleSlotType[]; // Accept slots as a separate prop
  isOwner: boolean;
  onSlotUpdate?: (slotNumber: number, updates: Partial<RaffleSlotType>) => void;
};

export default function RaffleBoard({ raffle, slots, isOwner, onSlotUpdate }: RaffleBoardProps) {
  const availableSlots = slots.filter(slot => slot.status === 'available').length;
  const reservedSlots = slots.filter(slot => slot.status === 'reserved').length;
  const paidSlots = slots.filter(slot => slot.status === 'paid').length;
  const [highlightedStatus, setHighlightedStatus] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Efecto para el confeti cuando la rifa es finalizada
  useEffect(() => {
    if (raffle.finalizedAt && raffle.winnerSlotNumber) {
      triggerSlotConfetti(`slot-${raffle.winnerSlotNumber}`);
    }
  }, [raffle.finalizedAt, raffle.winnerSlotNumber]);

  return (
    <Card className="bg-gradient-to-br from-background to-muted/10 border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              Tablero de Rifas
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              {raffle.name} - Progreso: {paidSlots + reservedSlots}/100
            </p>
          </div>
          <Badge variant={raffle.status === 'finalized' ? "destructive" : "secondary"} className="text-sm whitespace-nowrap">
            {raffle.status === 'finalized' ? "Finalizada" : "Activa"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <motion.div 
          ref={boardRef}
          className="grid grid-cols-10 gap-1 md:gap-2 max-w-2xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.02, // Pequeño retraso entre cada hijo
              },
            },
          }}
        >
          {slots.map((slot) => (
            <motion.div
              key={slot.slotNumber}
              id={`slot-${slot.slotNumber}`} // ID para el confeti
              variants={{
                hidden: { opacity: 0, scale: 0.8, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0 },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <RaffleSlot
                slot={slot}
                raffleId={raffle.id}
                isWinner={raffle.winnerSlotNumber === slot.slotNumber}
                isFinalized={!!raffle.finalizedAt}
                isOwner={isOwner}
                onSlotUpdate={onSlotUpdate}
                highlightedStatus={highlightedStatus}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Legend */}
        <StatusLegend
          availableSlots={availableSlots}
          reservedSlots={reservedSlots}
          paidSlots={paidSlots}
          highlightedStatus={highlightedStatus}
          setHighlightedStatus={setHighlightedStatus}
        />
      </CardContent>
    </Card>
  );
}
