import { Crown, User } from "lucide-react";
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
  isOwner: boolean;
  onSlotUpdate?: (slotNumber: number, updates: Partial<RaffleSlot>) => void;
  highlightedStatus: string | null;
};

export default function Slot({ slot, raffleId, isWinner, isFinalized, isOwner, onSlotUpdate, highlightedStatus }: SlotProps) {
  const { user } = useAuth();

  // Colores mejorados con gradientes sutiles
  const statusClasses = {
    available: "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm hover:shadow-md transition-colors duration-500", // Verde
    reserved: "bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-sm hover:shadow-md transition-colors duration-500", // Amarillo
    paid: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md transition-colors duration-500", // Azul
  };

  const isLoser = isFinalized && !isWinner && slot.status === 'paid';
  const loserClasses = isLoser ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white opacity-75" : "";

  const isEditable = isOwner && !isFinalized;

  const isHighlighted = highlightedStatus === slot.status || (isWinner && highlightedStatus === 'winner');

  const content = (
    <div
      className={cn(
        "relative aspect-square w-full rounded-lg flex flex-col items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 p-1.5 group overflow-hidden",
        statusClasses[slot.status],
        loserClasses,
        isWinner && "animate-winner-pulse bg-gradient-to-br from-amber-400 to-yellow-500 text-yellow-900 ring-2 ring-amber-500 ring-offset-2 ring-offset-background shadow-lg", // Dorado
        isFinalized && !isWinner && slot.status !== 'paid' && "opacity-50 cursor-not-allowed hover:scale-100",
        // Hover específicos por estado
        slot.status === 'available' && isEditable && "hover:scale-110 hover:-translate-y-1",
        slot.status === 'reserved' && isEditable && "hover:animate-shake",
        slot.status === 'paid' && isEditable && "hover:-translate-y-1.5",
        !isEditable && "cursor-default",
        // Efecto de resaltado
        isHighlighted && "border border-[0.5px] border-primary ring-4 ring-muted scale-105 shadow-xl"
      )}
    >
      {/* Número de casilla */}
      <span className="font-mono text-xs leading-tight drop-shadow-sm z-10 text-center w-full">
        {slot.slotNumber}
      </span>

      {/* Nombre del participante */}
      {slot.status === 'paid' && slot.participantName && (
        <div className="hidden sm:flex items-center gap-1 mt-0.5 z-10">
          <User className="w-2.5 h-2.5 opacity-80" />
          <span className="text-[0.55rem] leading-tight text-center break-words w-full font-medium">
            {slot.participantName}
          </span>
        </div>
      )}

      {/* Icono de ganador */}
      {isWinner && (
        <Crown className="absolute -top-1.5 -right-1.5 h-4 w-4 text-amber-700 drop-shadow-sm animate-crown-sparkle z-20" />
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

  const participantName = slot.participantName || "Vacío";
  const status = statusMap[slot.status];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {slotComponent}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-white/95 backdrop-blur-sm border-primary/20 shadow-lg">
          <div className="space-y-1">
            <p className="font-semibold text-primary">Casilla #{slot.slotNumber}</p>
            <p className="text-sm">Participante: <span className="font-medium">{participantName}</span></p>
            <p className="text-sm">Estado: <span className="font-medium">{status}</span></p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
