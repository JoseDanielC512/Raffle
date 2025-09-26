'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

interface SessionTimeoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStay: () => void;
  countdownSeconds: number;
}

export function SessionTimeoutDialog({ open, onOpenChange, onStay, countdownSeconds }: SessionTimeoutDialogProps) {
  const { logout } = useAuth();
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset states when dialog opens
      setCountdown(countdownSeconds);
      setIsTimeUp(false);
    } else {
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUp(true); // Trigger logout via effect
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, countdownSeconds]);

  useEffect(() => {
    if (isTimeUp) {
      onOpenChange(false); // Close the dialog
      logout();
    }
  }, [isTimeUp, logout, onOpenChange]);

  const handleStay = () => {
    onStay();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>¿Sigues ahí?</DialogTitle>
          <DialogDescription>
            Tu sesión está a punto de expirar por inactividad. Serás desconectado en {countdown} segundos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button onClick={handleStay}>Permanecer Conectado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
