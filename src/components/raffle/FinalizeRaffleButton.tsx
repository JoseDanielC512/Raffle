'use client';

import React, { useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import type { Raffle } from '@/lib/definitions';
import DeclareWinnerDialog from './DeclareWinnerDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FinalizeRaffleButtonProps {
  raffle: Raffle;
  isOwner: boolean;
}

export default function FinalizeRaffleButton({ raffle, isOwner }: FinalizeRaffleButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const { toast } = useToast();

  // Lógica para determinar si el botón debe ser visible
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a mediodía para comparar solo fechas

  const isFinalizationDate =
    raffle.finalizationDate &&
    new Date(raffle.finalizationDate).toDateString() === today.toDateString();

  const shouldShowButton = isOwner && !raffle.finalizedAt && isFinalizationDate;

  const handleConfirmFinalize = () => {
    setShowConfirmDialog(false);
    setShowWinnerDialog(true);
  };

  const handleFinalizationSuccess = () => {
    // La acción de finalización ya se ejecutó.
    // Podríamos mostrar un toast adicional si fuera necesario,
    // pero el DeclareWinnerDialog ya muestra uno.
    // El listener de onSnapshot en la página principal se encargará de refrescar la UI.
  };

  if (!shouldShowButton) {
    return null;
  }

  return (
    <>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full sm:w-auto">
            <Flag className="mr-2 h-4 w-4" />
            Finalizar Rifa
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-xs min-h-[40vh] p-4 sm:p-6 sm:max-w-[425px] rounded-lg bg-background border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              ¿Estás absolutamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción es irreversible. Una vez que declares el ganador, la rifa se
              finalizará permanentemente y no podrás realizar más cambios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-y-2 sm:space-y-0">
            <AlertDialogCancel className="w-full sm:w-auto mt-4 sm:mt-0 bg-accent text-accent-foreground hover:bg-accent/90">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmFinalize}
              className="w-full sm:w-auto"
            >
              Sí, finalizar rifa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeclareWinnerDialog
        raffleId={raffle.id}
        open={showWinnerDialog}
        onOpenChange={setShowWinnerDialog}
        onSuccess={handleFinalizationSuccess}
      />
    </>
  );
}
