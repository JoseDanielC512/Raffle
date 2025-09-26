import type { Raffle, RaffleSlot as RaffleSlotType } from "@/lib/definitions";
import RaffleSlot from "./raffle-slot";
import StatusLegend from "./StatusLegend";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { IconButton } from "../ui/icon-button";
import { HelpCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerSlotConfetti } from "@/lib/utils";

type RaffleBoardProps = {
  raffle: Raffle;
  slots: RaffleSlotType[];
  isOwner: boolean;
  onSlotUpdate?: (slotNumber: number, updates: Partial<RaffleSlotType>) => void;
  onInfoClick?: () => void;
};

export default function RaffleBoard({ raffle, slots, isOwner, onSlotUpdate, onInfoClick }: RaffleBoardProps) {
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
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl"></div>
      
      <Card className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-lg border-white/20 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <CardTitle className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                Tablero de Rifas
              </CardTitle>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Badge 
                  variant={raffle.status === 'finalized' ? "destructive" : "default"} 
                  className={`text-sm font-semibold px-3 py-1 rounded-full shadow-lg ${
                    raffle.status === 'finalized' 
                      ? 'bg-red-500/80 text-white border border-red-400/50' 
                      : 'bg-green-500/80 text-white border border-green-400/50'
                  }`}
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
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 shadow-md hover:shadow-lg transition-all duration-300"
                />
              </motion.div>
            )}
          </div>
          <motion.p 
            className="text-cyan-100 text-base md:text-lg font-light drop-shadow"
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
}
