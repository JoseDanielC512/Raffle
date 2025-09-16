import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RaffleSlot } from "@/lib/definitions";
import EditSlotDialog from "./edit-slot-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SlotProps = {
  slot: RaffleSlot;
  raffleId: string;
  isWinner: boolean;
  isFinalized: boolean;
};

export default function Slot({ slot, raffleId, isWinner, isFinalized }: SlotProps) {
  const statusClasses = {
    available: "bg-slate-200 hover:bg-slate-300 text-slate-500",
    reserved: "bg-tertiary hover:bg-tertiary/90 text-white",
    paid: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
  };
  
  const content = (
    <div
      className={cn(
        "relative aspect-square w-full rounded-md flex flex-col items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer",
        statusClasses[slot.status],
        isWinner && "animate-winner-pulse bg-accent text-accent-foreground ring-2 ring-accent ring-offset-2 ring-offset-background",
        isFinalized && !isWinner && "opacity-60 cursor-not-allowed"
      )}
    >
      <span className="font-mono">{slot.slotNumber}</span>
      {isWinner && <Crown className="absolute -top-2 -right-2 h-5 w-5 text-amber-400" />}
    </div>
  );

  const slotComponent = isFinalized ? (
    content
  ) : (
    <EditSlotDialog slot={slot} raffleId={raffleId}>
      {content}
    </EditSlotDialog>
  );

  const statusMap: { [key: string]: string } = {
    available: "Disponible",
    reserved: "Reservado",
    paid: "Pagado",
  };

  const participantName = slot.participantName || "Vacío";
  const status = statusMap[slot.status];

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
            {slotComponent}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">Casilla #{slot.slotNumber}</p>
          <p>Participante: {participantName}</p>
          <p>Estado: {status}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
