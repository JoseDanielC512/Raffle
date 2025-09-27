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
import type { User } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useToast } from "@/hooks/use-toast";

type EditSlotDialogProps = {
  children: React.ReactNode;
  slot: RaffleSlot;
  raffleId: string;
  user: User | null;
  isOwner: boolean;
  onSlotUpdate?: (slotNumber: number, updates: Partial<RaffleSlot>) => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Guardar Cambios
    </Button>
  );
}

export default function EditSlotDialog({ children, slot, raffleId, user, isOwner, onSlotUpdate }: EditSlotDialogProps) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<SlotStatus>(slot.status);
  const [participantName, setParticipantName] = useState(slot.participantName || '');
  
  const { toast } = useToast();

  const [state, dispatch] = useActionState(updateSlotAction, { message: '', success: false });

  useEffect(() => {
    if (user && open) {
      user.getIdToken().then(setToken);
    }
  }, [user, open]);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast({
          title: "Casilla Actualizada",
          description: state.message,
          variant: "success",
        });
        if (onSlotUpdate) {
          let finalParticipantName = participantName;
          if (currentStatus === 'available') {
            finalParticipantName = '';
          }
          onSlotUpdate(slot.slotNumber, {
            participantName: finalParticipantName,
            status: currentStatus,
          });
        }
        setOpen(false);
      } else {
        toast({
          title: "Error al actualizar casilla",
          description: state.message,
          variant: "destructive",
        });
      }
    }
  }, [state, toast, onSlotUpdate, slot.slotNumber, participantName, currentStatus]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setCurrentStatus(slot.status);
      setParticipantName(slot.participantName || '');
    }
  };

  if (!isOwner) {
    return <>{children}</>;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xs min-h-[40vh] p-4 sm:p-6 sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Casilla #{slot.slotNumber}</DialogTitle>
          <DialogDescription>
            Actualiza el nombre del participante y el estado de pago de esta casilla.
          </DialogDescription>
        </DialogHeader>
        <form action={dispatch} className="space-y-6">
            <input type="hidden" name="raffleId" value={raffleId} />
            <input type="hidden" name="slotNumber" value={slot.slotNumber.toString()} />
            <input type="hidden" name="idToken" value={token} />
            <div className="space-y-2">
                <Label htmlFor="participantName">Nombre del Participante</Label>
                <Input
                  id="participantName"
                  name="participantName"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label>Estado de Pago</Label>
                <RadioGroup name="status" value={currentStatus} onValueChange={(value) => setCurrentStatus(value as SlotStatus)} className="flex flex-col space-y-2" required>
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
                <SubmitButton />
                <DialogClose asChild>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto mt-4 sm:mt-0 sm:outline sm:outline-1 sm:outline-border bg-tekhelet-500 text-tekhelet-100 hover:bg-tekhelet-500/90"
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
