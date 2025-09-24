import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Raffle } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Crown } from "lucide-react";

type RaffleCardProps = {
  raffle: Raffle & { filledSlots?: number; winnerName?: string };
};

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const filledSlots = raffle.filledSlots || 0;
  const progress = (filledSlots / 100) * 100;
  const isFinalized = raffle.status === 'finalized' || !!raffle.finalizedAt;

  return (
    <Card className="flex flex-col bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="bg-muted/30 rounded-t-lg border-b border-border/50 pb-4">
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 flex items-center gap-2">{raffle.name}</CardTitle>
            <Badge variant={raffle.finalizedAt ? "destructive" : "secondary"} className="text-xs">
                {raffle.finalizedAt ? "Finalizada" : "Activa"}
            </Badge>
        </div>
        <CardDescription className="line-clamp-2">{raffle.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 flex-grow">
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
            <span>Progreso</span>
            <span>{filledSlots} / 100</span>
        </div>
        <Progress value={progress} aria-label={`${progress}% of slots filled`} className="h-2" />
        {isFinalized && raffle.winnerSlotNumber && (
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
              Ganador: <span className="font-medium text-primary">{raffle.winnerName || 'No asignado'}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
