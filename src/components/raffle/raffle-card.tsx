import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Raffle } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { motion } from "framer-motion";

type RaffleCardProps = {
  raffle: Raffle & { filledSlots?: number; winnerName?: string };
};

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const filledSlots = raffle.filledSlots || 0;
  const progress = (filledSlots / 100) * 100;
  const isFinalized = raffle.status === 'finalized' || !!raffle.finalizedAt;

  return (
    <Card className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl bg-card/80 backdrop-blur-sm border-border/60 shadow-lg rounded-2xl">
      {/* Fondo con degradado sutil en hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-acento-fuerte/5 via-transparent to-acento-calido/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      
      <CardHeader className="pb-4 relative z-10 bg-gradient-to-r from-acento-fuerte/90 via-acento-fuerte/80 to-acento-calido/90 p-6 text-white rounded-t-lg">
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2 group-hover:text-white transition-colors duration-300">{raffle.name}</CardTitle>
            <Badge 
              className={`text-xs font-semibold ${
                isFinalized 
                  ? "bg-warning text-warning-foreground hover:bg-warning/90" 
                  : "bg-success text-success-foreground hover:bg-success/90"
              }`}
            >
                {isFinalized ? "Finalizada" : "Activa"}
            </Badge>
        </div>
        <div className="line-clamp-2 pt-1 text-white/90 text-sm">{raffle.description}</div>
      </CardHeader>
      <CardContent className="pt-4 flex-grow relative z-10">
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-3 group-hover:text-foreground transition-colors duration-300">
            <span className="font-medium">Progreso</span>
            <span className="font-semibold text-acento-fuerte">{filledSlots} / 100</span>
        </div>
        <div className="relative">
          <Progress 
            value={progress} 
            aria-label={`${progress}% of slots filled`} 
            className="h-3 group-hover:h-4 transition-all duration-300"
          />
          {/* Efecto de brillo en la barra de progreso */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-full"></div>
        </div>
        {isFinalized && raffle.winnerSlotNumber && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-4"
          >
            <Card className="border-acento-fuerte/30 bg-gradient-to-br from-acento-fuerte/20 via-acento-calido/15 to-slot-winning/10 shadow-md overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-slot-winning to-acento-fuerte rounded-full shadow-md">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Crown className="h-6 w-6 text-white drop-shadow-sm" />
                      </motion.div>
                    </div>
                    <h4 className="text-lg font-bold text-primario-oscuro">¡Ganador!</h4>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-sm text-primario-oscuro/80">
                      Slot: <Badge className="bg-acento-fuerte text-white text-xs font-mono px-2 py-1 hover:bg-acento-fuerte/90">#{raffle.winnerSlotNumber}</Badge>
                    </div>
                    <div className="text-sm font-medium text-primario-oscuro">
                      {raffle.winnerName || 'No asignado'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
