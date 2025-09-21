'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { RaffleSlot, SlotStatus } from "@/lib/definitions";
import { updateSlotAction } from "@/app/actions";
import type { User } from "firebase/auth"; // Import User from firebase/auth
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type EditSlotDialogProps = {
  children: React.ReactNode;
  slot: RaffleSlot;
  raffleId: string;
  user: User | null; // Added user prop
  isOwner: boolean;
  onSlotUpdate?: (slotNumber: number, updates: Partial<RaffleSlot>) => void;
};

export default function EditSlotDialog({ children, slot, raffleId, user, isOwner, onSlotUpdate }: EditSlotDialogProps) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<SlotStatus>(slot.status);
  const [participantName, setParticipantName] = useState(slot.participantName || '');
  const [participantNameError, setParticipantNameError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchToken() {
      if (!user) {
        setToken(null);
        return;
      }
      setTokenLoading(true);
      try {
        const idToken = await user.getIdToken();
        setToken(idToken);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo obtener el token de autenticación.",
          variant: "destructive"
        });
        setToken(null);
      } finally {
        setTokenLoading(false);
      }
    }

    if (open) {
      fetchToken();
      // Resetear el estado del formulario al abrir el diálogo
      setCurrentStatus(slot.status);
      setParticipantName(slot.participantName || '');
    } else {
      setToken(null);
      setTokenLoading(false);
    }
  }, [open, user, toast, slot.status]);

  // Efecto para validar el nombre del participante cuando el estado cambia
  useEffect(() => {
    if (currentStatus === 'reserved' || currentStatus === 'paid') {
      if (!participantName.trim()) {
        setParticipantNameError('El nombre del participante es obligatorio.');
      } else {
        setParticipantNameError(null);
      }
    } else {
      setParticipantNameError(null);
    }
  }, [currentStatus, participantName]);

  if (!isOwner) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación manual: El estado de pago es obligatorio.
    if (!currentStatus) {
      toast({
        title: "Campo Obligatorio",
        description: "Por favor, selecciona un estado de pago.",
        className: "bg-yellow-500 text-yellow-900 border-yellow-600",
      });
      return;
    }

    // Validación condicional: El nombre del participante es obligatorio si el estado es 'reserved' o 'paid'.
    if ((currentStatus === 'reserved' || currentStatus === 'paid') && !participantName.trim()) {
      // El error ya debería estar visible en el UI gracias al useEffect
      return;
    }

    if (!token) {
      toast({
        title: "Error",
        description: "Token de autenticación requerido.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append('idToken', token);
    
    let finalParticipantName = participantName;
    // Lógica de negocio: Si el estado es "available", el nombre del participante debe ser vacío.
    if (currentStatus === 'available') {
      finalParticipantName = '';
    }
    formData.append('status', currentStatus);
    formData.set('participantName', finalParticipantName.trim()); // Aseguramos que el FormData tenga el nombre correcto y sin espacios

    try {
      await updateSlotAction(formData);
      if (onSlotUpdate) {
        onSlotUpdate(slot.slotNumber, {
          participantName: finalParticipantName,
          status: currentStatus,
        });
      }
      setOpen(false);
      // Mensaje de éxito más específico
      const statusText = currentStatus === 'available' ? 'Disponible' : currentStatus === 'reserved' ? 'Reservado' : 'Pagado';
      const participantText = finalParticipantName ? ` para ${finalParticipantName}` : '';
      toast({
        title: "Casilla Actualizada",
        description: `La casilla #${slot.slotNumber} ahora está ${statusText}${participantText}.`,
        className: "bg-green-600 text-white border-green-700",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la casilla. Por favor, inténtalo de nuevo.",
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xs min-h-[40vh] p-4 sm:p-6 sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Casilla #{slot.slotNumber}</DialogTitle>
          <DialogDescription>
            Actualiza el nombre del participante y el estado de pago de esta casilla.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="raffleId" value={raffleId} />
            <input type="hidden" name="slotNumber" value={slot.slotNumber} />
            <div className="space-y-2">
                <Label htmlFor="participantName">Nombre del Participante</Label>
                <Input
                id="participantName"
                name="participantName"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                disabled={tokenLoading}
                className={participantNameError ? "border-red-500" : ""}
                />
                {participantNameError && <p className="text-sm text-red-500">{participantNameError}</p>}
            </div>
            <div className="space-y-2">
                <Label>Estado de Pago</Label>
                <RadioGroup name="status" value={currentStatus} onValueChange={(value) => setCurrentStatus(value as SlotStatus)} disabled={tokenLoading} className="flex flex-col space-y-2" required>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="available" id="s-available" />
                        <Label htmlFor="s-available">Disponible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="reserved" id="s-reserved" />
                        <Label htmlFor="s-reserved">Reservado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paid" id="s-paid" />
                        <Label htmlFor="s-paid">Pagado</Label>
                    </div>
                </RadioGroup>
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2">
                <Button type="submit" disabled={tokenLoading || !token || submitting} className="w-full sm:w-auto">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
                <DialogClose asChild>
                    <Button 
                      variant="outline" 
                      disabled={tokenLoading || submitting} 
                      className="w-full sm:w-auto mt-4 sm:mt-0 sm:outline sm:outline-1 sm:outline-border bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Cancelar
                    </Button>
                </DialogClose>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
