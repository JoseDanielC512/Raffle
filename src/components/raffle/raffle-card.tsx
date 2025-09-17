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
import { ArrowRight } from "lucide-react";

type RaffleCardProps = {
  raffle: Raffle & { filledSlots?: number };
};

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const filledSlots = raffle.filledSlots || 0;
  const progress = (filledSlots / 100) * 100;

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-xl">{raffle.name}</CardTitle>
            <Badge variant={raffle.finalizedAt ? "destructive" : "secondary"}>
                {raffle.finalizedAt ? "Finalizada" : "Activa"}
            </Badge>
        </div>
        <CardDescription className="line-clamp-2">{raffle.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
            <span>Progreso</span>
            <span>{filledSlots} / 100</span>
        </div>
        <Progress value={progress} aria-label={`${progress}% of slots filled`} className="h-2" />
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/raffle/${raffle.id}`}>
            Ver Rifa <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
