import { Crown } from "lucide-react";
import { cn, triggerSlotConfetti } from "@/lib/utils";
import type { RaffleSlot } from "@/lib/definitions";
import EditSlotDialog from "./edit-slot-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/context/auth-context";
import { memo } from "react";

type SlotProps = {
  slot: RaffleSlot;
  raffleId: string;
  isWinner: boolean;
  isFinalized: boolean;
  isOwner: boolean;
  onSlotUpdate?: (slotNumber: number, updates: Partial<RaffleSlot>) => void;
  highlightedStatus: string | null;
};

const Slot = memo(({ slot, raffleId, isWinner, isFinalized, isOwner, onSlotUpdate, highlightedStatus }: SlotProps) => {
  const { user } = useAuth();

  const statusClasses = {
    available: "bg-gradient-to-br from-slot-available to-slot-available/70 text-primario-oscuro shadow-sm hover:shadow-md transition-all duration-300",
    reserved: "bg-gradient-to-br from-slot-reserved to-slot-reserved/80 text-white shadow-sm hover:shadow-md transition-all duration-300",
    paid: "bg-gradient-to-br from-slot-paid to-slot-paid/80 text-white shadow-sm hover:shadow-md transition-all duration-300",
  };

  const isLoser = isFinalized && !isWinner && slot.status === 'paid';
  const loserClasses = isLoser ? "bg-gradient-to-br from-slot-losing to-slot-losing/60 text-primario-oscuro shadow-sm" : "";

  const isEditable = isOwner && !isFinalized;

  const isHighlighted = highlightedStatus === slot.status || (isWinner && highlightedStatus === 'winner');

  const content = (
    <div
      className={cn(
        "relative aspect-square w-full rounded-lg flex flex-col items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 p-1.5 group overflow-visible",
        statusClasses[slot.status],
        loserClasses,
        isWinner && "min-h-[2rem] animate-winner-pulse bg-gradient-to-br from-slot-winning to-slot-winning/80 text-primario-oscuro ring-4 ring-slot-winning ring-offset-2 ring-offset-background shadow-xl",
        isFinalized && !isWinner && slot.status !== 'paid' && "opacity-50 cursor-not-allowed hover:scale-100",
        isEditable && "hover:scale-110 hover:-translate-y-1",
        !isEditable && "cursor-default",
        isHighlighted && "ring-2 ring-offset-2 ring-acento-fuerte scale-105 shadow-xl"
      )}
    >
      {isWinner ? (
        <div
          className="absolute inset-0 flex items-center justify-center z-20"
          onClick={async () => {
            await triggerSlotConfetti(`slot-${slot.slotNumber}`);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerSlotConfetti(`slot-${slot.slotNumber}`);
            }
          }}
          role="button"
          aria-label="Casilla ganadora - Presiona Enter o Espacio para confetti"
          tabIndex={0}
        >
          <Crown 
            className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primario-oscuro drop-shadow-lg animate-bounce" 
            aria-hidden="true"
          />
        </div>
      ) : (
        <>
          {/* Número de casilla */}
          <span className="font-mono text-xs leading-tight drop-shadow-sm z-10 text-center w-full">
            {slot.slotNumber}
          </span>
        </>
      )}


      {/* Efecto de brillo para casillas pagadas */}
      {slot.status === 'paid' && !isWinner && (
        <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
      )}
    </div>
  );

  // Componente de slot final
  const slotComponent = isEditable ? (
    <EditSlotDialog slot={slot} raffleId={raffleId} user={user} isOwner={isOwner} onSlotUpdate={onSlotUpdate}>
      {content}
    </EditSlotDialog>
  ) : (
    content
  );

  const statusMap: { [key: string]: string } = {
    available: "Disponible",
    reserved: "Reservado",
    paid: "Pagado",
  };

  const status = statusMap[slot.status];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative" aria-describedby={`tooltip-${slot.slotNumber}`}>
            {slotComponent}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" id={`tooltip-${slot.slotNumber}`} className="bg-primario-oscuro text-white border-acento-fuerte/50 shadow-lg">
          <div className="space-y-1 p-1">
            <p className="font-semibold text-white">Casilla #{slot.slotNumber}</p>
            <p className="text-sm">Estado: <span className="font-medium">{status}</span></p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

Slot.displayName = "RaffleSlot";

export default Slot;
