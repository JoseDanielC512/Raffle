import type { Raffle, RaffleSlot as RaffleSlotType } from "@/lib/definitions";
import RaffleSlot from "./raffle-slot";
import StatusLegend from "./StatusLegend";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { IconButton } from "../ui/icon-button";
import { HelpCircle } from "lucide-react";
import { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerSlotConfetti } from "@/lib/utils";

type RaffleBoardProps = {
  raffle: Raffle;
  slots: RaffleSlotType[];
  isOwner: boolean;
  onSlotUpdate?: (slotNumber: number, updates: Partial<RaffleSlotType>) => void;
  onInfoClick?: () => void;
};

const RaffleBoard = memo(({ raffle, slots, isOwner, onSlotUpdate, onInfoClick }: RaffleBoardProps) => {
  const availableSlots = slots.filter(slot => slot.status === 'available').length;
  const reservedSlots = slots.filter(slot => slot.status === 'reserved').length;
  const paidSlots = slots.filter(slot => slot.status === 'paid').length;
  const [highlightedStatus, setHighlightedStatus] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (raffle.finalizedAt && raffle.winnerSlotNumber) {
      triggerSlotConfetti(`slot-${raffle.winnerSlotNumber}`);
    }
  }, [raffle.finalizedAt, raffle.winnerSlotNumber]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
    >
      {/* Outer glow effect */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fondo-base/20 via-transparent to-transparent rounded-3xl blur-2xl"></div>
      
      <Card className="bg-gradient-to-br from-fondo-base/60 via-fondo-base/40 to-fondo-base/60 backdrop-blur-xl border shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 bg-gradient-to-r from-acento-fuerte/10 to-acento-calido/10 border-b">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <CardTitle className="text-2xl md:text-3xl font-bold text-primario-oscuro drop-shadow-sm">
                Tablero de la Rifa
              </CardTitle>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Badge 
                  variant={raffle.status === 'finalized' ? "outline" : "default" } 
                  className="text-sm font-semibold px-3 py-1 rounded-full shadow-lg"
                >
                  {raffle.status === 'finalized' ? "Finalizada" : "Activa"}
                </Badge>
              </motion.div>
            </div>
            {onInfoClick && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <IconButton
                  onClick={onInfoClick}
                  icon={<HelpCircle className="h-5 w-5" />}
                  tooltip="Ver información de la rifa"
                  tooltipSide="bottom"
                  aria-label="Ver información de la rifa"
                  variant="ghost"
                />
              </motion.div>
            )}
          </div>
          <motion.p 
            className="text-muted-foreground text-base md:text-lg font-light drop-shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {raffle.name} - Progreso: {paidSlots + reservedSlots}/100
          </motion.p>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <motion.div 
            ref={boardRef}
            className="grid grid-cols-10 gap-2 md:gap-3 max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.015,
                },
              },
            }}
          >
            <AnimatePresence>
              {slots.map((slot) => (
                <motion.div
                  key={slot.slotNumber}
                  id={`slot-${slot.slotNumber}`}
                  variants={{
                    hidden: { opacity: 0, scale: 0.5, y: 25 },
                    visible: { opacity: 1, scale: 1, y: 0 },
                  }}
                  transition={{ 
                    duration: 0.4, 
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  layout
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
            </AnimatePresence>
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <StatusLegend
              availableSlots={availableSlots}
              reservedSlots={reservedSlots}
              paidSlots={paidSlots}
              highlightedStatus={highlightedStatus}
              setHighlightedStatus={setHighlightedStatus}
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

RaffleBoard.displayName = "RaffleBoard";

export default RaffleBoard;
