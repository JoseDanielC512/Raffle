'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Crown, Loader2, PartyPopper } from 'lucide-react';
import type { Raffle } from '@/lib/definitions';
import { finalizeRaffleAction } from '@/app/actions';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function RaffleFinalization({ raffle, slots }: { raffle: Raffle; slots: any[] }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOwner, setIsOwner] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (user && raffle.ownerId === user.uid) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
    setCheckingOwnership(false);
  }, [user, raffle.ownerId]);

  const handleFinalize = async () => {
    setIsPending(true);
    try {
      await finalizeRaffleAction(raffle.id);
      toast({
        title: "Éxito",
        description: "La rifa ha sido finalizada.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo finalizar la rifa.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  if (checkingOwnership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Finalizar Rifa</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[100px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (raffle.finalizedAt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">¡Rifa Completada!</CardTitle>
          <CardDescription>Se ha seleccionado un ganador.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 bg-accent/10 rounded-lg">
            <PartyPopper className="h-12 w-12 text-accent" />
            <p className="text-sm text-muted-foreground mt-4">El número ganador es</p>
            <p className="text-6xl font-bold font-mono text-accent">{raffle.winnerSlotNumber}</p>
            <p className="mt-2 font-semibold">
              ¡Felicidades, {slots.find((s: any) => s.slotNumber === raffle.winnerSlotNumber)?.participantName || 'Ganador'}!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Finalizar Rifa</CardTitle>
          <CardDescription>Solo el organizador puede finalizar la rifa.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 border-2 border-dashed rounded-lg">
            <Crown className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">
              No tienes permiso para finalizar esta rifa.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Finalizar Rifa</CardTitle>
        <CardDescription>Sortea un ganador al azar para finalizar la rifa.</CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" disabled={isPending} onClick={handleFinalize}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Crown className="mr-2 h-4 w-4" />
              )}
              Finalizar Rifa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción es irreversible. Se seleccionará un ganador al azar de las casillas pagadas y la rifa se finalizará. No podrás realizar más cambios.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <Button disabled={isPending} onClick={handleFinalize}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Confirmar Finalización"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
