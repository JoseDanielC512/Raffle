import type { Raffle, RaffleSlot as RaffleSlotType } from "@/lib/definitions";
import RaffleSlot from "./raffle-slot";
import StatusLegend from "./StatusLegend";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useState, useEffect, useRef, memo } from "react";
import { triggerSlotConfetti } from "@/lib/utils";
import { motion } from "framer-motion";

type RaffleBoardProps = {
  raffle: Raffle;
  slots: RaffleSlotType[];
  isOwner: boolean;
  onSlotUpdate?: (slotNumber: number, updates: Partial<RaffleSlotType>) => void;
};

const RaffleBoard = memo(({ raffle, slots, isOwner, onSlotUpdate }: RaffleBoardProps) => {
  const availableSlots = slots.filter(slot => slot.status === 'available').length;
  const reservedSlots = slots.filter(slot => slot.status === 'reserved').length;
  const paidSlots = slots.filter(slot => slot.status === 'paid').length;
  const [highlightedStatus, setHighlightedStatus] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Función para disparar confetti en la casilla ganadora
  const handleWinnerHighlight = () => {
    if (raffle.winnerSlotNumber) {
      triggerSlotConfetti(`slot-${raffle.winnerSlotNumber}`);
    }
  };

  useEffect(() => {
    if (raffle.finalizedAt && raffle.winnerSlotNumber) {
      triggerSlotConfetti(`slot-${raffle.winnerSlotNumber}`);
    }
  }, [raffle.finalizedAt, raffle.winnerSlotNumber]);

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group relative overflow-hidden bg-card/80 backdrop-blur-sm shadow-lg rounded-2xl hover:shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-acento-fuerte/10 via-acento-fuerte/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-acento-calido/5 to-acento-fuerte/10 opacity-50 rounded-2xl"></div>
        
        {/* Efecto de brillo en hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-2xl"></div>
        
        <Card className="relative z-10 bg-card/80 backdrop-blur-sm border-border/60 shadow-lg rounded-2xl hover:border-primary/40">
          <CardHeader className="pb-4 relative z-10 bg-gradient-to-r from-acento-fuerte/90 via-acento-fuerte/80 to-acento-calido/90 p-6 text-white rounded-t-2xl">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <CardTitle className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">
                  Tablero de la Rifa
                </CardTitle>
                <div>
                  <Badge 
                    className={`text-sm font-semibold px-3 py-1 rounded-full shadow-lg ${
                      raffle.status === 'finalized' 
                        ? "bg-warning text-warning-foreground hover:bg-warning/90" 
                        : "bg-success text-success-foreground hover:bg-success/90"
                    }`}
                  >
                    {raffle.status === 'finalized' ? "Finalizada" : "Activa"}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-white/90 text-base md:text-lg font-light drop-shadow-sm">
              {raffle.name} - Progreso: {paidSlots + reservedSlots}/100
            </p>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div 
              ref={boardRef}
              className="grid grid-cols-10 gap-2 md:gap-3 max-w-3xl mx-auto"
            >
              {slots.map((slot) => (
                <div
                  key={slot.slotNumber}
                  id={`slot-${slot.slotNumber}`}
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
                </div>
              ))}
            </div>

            {/* Legend */}
            <div>
              <StatusLegend
                availableSlots={availableSlots}
                reservedSlots={reservedSlots}
                paidSlots={paidSlots}
                highlightedStatus={highlightedStatus}
                setHighlightedStatus={setHighlightedStatus}
                onWinnerHighlight={handleWinnerHighlight}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});

RaffleBoard.displayName = "RaffleBoard";

export default RaffleBoard;
