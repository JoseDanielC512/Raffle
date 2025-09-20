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
import { useAuth } from "@/context/auth-context";

type SlotProps = {
  slot: RaffleSlot;
  raffleId: string;
  isWinner: boolean;
  isFinalized: boolean;
};

export default function Slot({ slot, raffleId, isWinner, isFinalized }: SlotProps) {
  const { user } = useAuth();
  const statusClasses = {
    available: "bg-green-500 hover:bg-green-600 text-white", // Verde
    reserved: "bg-yellow-500 hover:bg-yellow-600 text-white", // Amarillo
    paid: "bg-blue-500 hover:bg-blue-600 text-white", // Azul
  };

  const isLoser = isFinalized && !isWinner && slot.status === 'paid';
  const loserClasses = isLoser ? "bg-gray-400 text-white" : "";
  
  const content = (
    <div
      className={cn(
        "relative aspect-square w-full rounded-md flex flex-col items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer p-1 hover:scale-105",
        statusClasses[slot.status],
        loserClasses,
        isWinner && "animate-winner-pulse bg-yellow-400 text-yellow-900 ring-2 ring-yellow-500 ring-offset-2 ring-offset-background", // Dorado
        isFinalized && !isWinner && slot.status !== 'paid' && "opacity-60 cursor-not-allowed hover:scale-100"
      )}
    >
      <span className="font-mono text-xs leading-tight">{slot.slotNumber}</span>
      {slot.status === 'paid' && slot.participantName && (
        <span className="text-[0.6rem] leading-tight text-center break-words w-full">
          {slot.participantName}
        </span>
      )}
      {isWinner && <Crown className="absolute -top-2 -right-2 h-5 w-5 text-yellow-700" />}
    </div>
  );

  // We will move the ownership check to EditSlotDialog for better encapsulation
  // For now, we always pass the content to EditSlotDialog if not finalized.
  // The EditSlotDialog itself will check for ownership.
  const slotComponent = isFinalized ? (
    content
  ) : (
    <EditSlotDialog slot={slot} raffleId={raffleId} user={user}>
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
