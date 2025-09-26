'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Import for animations
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

interface FinalizeRaffleButtonProps {
  raffle: Raffle;
  isOwner: boolean;
}

export default function FinalizeRaffleButton({ raffle, isOwner }: FinalizeRaffleButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="destructive" 
              className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl border border-red-400/50 transition-all duration-300"
            >
              <Flag className="mr-2 h-5 w-5" />
              Finalizar Rifa
            </Button>
          </motion.div>
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
    </motion.div>
  );
}
