import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import type { Raffle } from "@/lib/definitions";

type RaffleInfoCardProps = {
  raffle: Raffle;
  winnerName?: string;
};

export default function RaffleInfoCard({ raffle, winnerName }: RaffleInfoCardProps) {
  const isFinalized = raffle.status === 'finalized';

  return (
    <Card className="flex flex-col bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="bg-muted/30 rounded-t-lg border-b border-border/50 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 flex items-center gap-2">
          <span className="w-2 h-2 bg-accent rounded-full"></span>
          Información de la Rifa
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 flex-grow">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-muted-foreground">Casillas totales:</span>
          <span className="text-xs sm:text-sm font-medium">100</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-muted-foreground">Creada por:</span>
          <span className="text-xs sm:text-sm font-medium">Organizador</span>
        </div>
        
        {isFinalized && winnerName && (
          <div 
            className="mt-4 p-3 bg-amber-50/50 rounded-md space-y-2 border border-amber-200/50 transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2" 
            role="region" 
            aria-label="Detalles de rifa finalizada"
          >
            <p className="font-semibold text-primary flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-amber-500" />
              Slot Ganador: <span className="text-base font-bold text-amber-700">{raffle.winnerSlotNumber}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Ganador: <span className="font-medium text-primary">{winnerName}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
