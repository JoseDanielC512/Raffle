import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Raffle } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

type RaffleCardProps = {
  raffle: Raffle & { filledSlots?: number; winnerName?: string };
};

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const filledSlots = raffle.filledSlots || 0;
  const progress = (filledSlots / 100) * 100;
  const isFinalized = raffle.status === 'finalized' || !!raffle.finalizedAt;

  return (
    <Card className="flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-200 flex items-center gap-2">{raffle.name}</CardTitle>
            <Badge variant={isFinalized ? "outline" : "default"} className="text-xs">
                {isFinalized ? "Finalizada" : "Activa"}
            </Badge>
        </div>
        <CardDescription className="line-clamp-2 pt-1">{raffle.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 flex-grow">
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
            <span>Progreso</span>
            <span>{filledSlots} / 100</span>
        </div>
        <Progress value={progress} aria-label={`${progress}% of slots filled`} className="h-2" />
        {isFinalized && raffle.winnerSlotNumber && (
          <div 
            className="mt-4 p-3 bg-slot-winning/10 rounded-md space-y-2 border border-slot-winning/20 transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2" 
            role="region" 
            aria-label="Detalles de rifa finalizada"
          >
            <p className="font-semibold text-slot-winning flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-slot-winning" />
              Slot Ganador: <span className="text-base font-bold">{raffle.winnerSlotNumber}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Ganador: <span className="font-medium text-foreground">{raffle.winnerName || 'No asignado'}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
