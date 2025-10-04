'use client';

import React, { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Trophy, Loader2 } from 'lucide-react';
import { finalizeRaffleWithWinnerAction } from '@/app/actions';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

interface DeclareWinnerDialogProps {
  raffleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant="destructive">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Finalizando...
        </>
      ) : (
        <>
          <Trophy className="mr-2 h-4 w-4" />
          Declarar Ganador y Finalizar
        </>
      )}
    </Button>
  );
}

export default function DeclareWinnerDialog({
  raffleId,
  open,
  onOpenChange,
  onSuccess,
}: DeclareWinnerDialogProps) {
  const { user } = useAuth();
  const [idToken, setIdToken] = useState('');
  const { toast } = useToast();

  const [finalizeState, finalizeDispatch] = useActionState(finalizeRaffleWithWinnerAction, { message: '', success: false });

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setIdToken);
    }
  }, [user]);

  useEffect(() => {
    if (finalizeState.success && finalizeState.message) {
      toast({
        title: '¡Rifa Finalizada!',
        description: finalizeState.message,
        variant: 'success',
      });
      onOpenChange(false);
      onSuccess();
    } else if (!finalizeState.success && finalizeState.message) {
      toast({
        title: 'Error al finalizar rifa',
        description: finalizeState.message,
        variant: 'destructive',
      });
    }
  }, [finalizeState, toast, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs min-h-[40vh] p-4 sm:p-6 sm:max-w-[425px] rounded-lg bg-background border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slot-winning">
            <Trophy className="h-5 w-5" />
            Declarar Ganador
          </DialogTitle>
          <DialogDescription>
            Ingresa el número de la casilla ganadora. Esta acción es irreversible y finalizará la rifa.
          </DialogDescription>
        </DialogHeader>
        <form action={finalizeDispatch} className="space-y-6">
          <input type="hidden" name="raffleId" value={raffleId} />
          <input type="hidden" name="idToken" value={idToken} />
          <div className="space-y-2">
            <Label htmlFor="winnerSlotNumber">Número de Casilla Ganadora</Label>
            <Input
              id="winnerSlotNumber"
              name="winnerSlotNumber"
              type="number"
              placeholder="Ej: 55"
              min="0"
              max="99"
              required
            />
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
