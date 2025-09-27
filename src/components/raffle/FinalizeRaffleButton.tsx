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
    // Show success toast
    toast({
      title: "¡Rifa finalizada!",
      description: "La rifa ha sido finalizada exitosamente y el ganador ha sido declarado.",
      variant: "success",
    });
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
              className="w-full sm:w-auto bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-battleship_gray-100 font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl border border-sage-400/50 transition-all duration-300"
            >
              <Flag className="mr-2 h-5 w-5" />
              Finalizar Rifa
            </Button>
          </motion.div>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-xs min-h-[40vh] p-4 sm:p-6 sm:max-w-[425px] rounded-lg bg-background border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-sage-500">
              <AlertTriangle className="h-5 w-5" />
              ¿Estás absolutamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-battleship_gray-600 dark:text-battleship_gray-400">
              Esta acción es irreversible. Una vez que declares el ganador, la rifa se
              finalizará permanentemente y no podrás realizar más cambios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-y-2 sm:space-y-0">
            <AlertDialogCancel className="w-full sm:w-auto mt-4 sm:mt-0 bg-tekhelet-500 text-tekhelet-100 hover:bg-tekhelet-500/90">
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
