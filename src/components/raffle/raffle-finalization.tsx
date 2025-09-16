'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Crown, Loader2, PartyPopper, Ticket } from 'lucide-react';
import type { Raffle } from '@/lib/definitions';
import { finalizeRaffleAction } from '@/app/actions';

function FinalizeButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction onClick={(e) => {
        if (pending) e.preventDefault();
    }}
    disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sorteando Ganador...
        </>
      ) : (
        "Sí, Sortear el Ganador"
      )}
    </AlertDialogAction>
  );
}


export default function RaffleFinalization({ raffle }: { raffle: Raffle }) {
  const [isPending, setIsPending] = useState(false);

  async function handleFinalize() {
    setIsPending(true);
    try {
        await finalizeRaffleAction(raffle.id);
    } catch (error) {
        console.error(error);
    } finally {
        setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          {raffle.finalizedAt ? '¡Rifa Completada!' : 'Finalizar Rifa'}
        </CardTitle>
        <CardDescription>
          {raffle.finalizedAt
            ? 'Se ha seleccionado un ganador.'
            : 'Sortea un ganador al azar para finalizar la rifa.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {raffle.winnerSlotNumber ? (
          <div className="flex flex-col items-center justify-center p-6 bg-accent/10 rounded-lg">
            <PartyPopper className="h-12 w-12 text-accent" />
            <p className="text-sm text-muted-foreground mt-4">El número ganador es</p>
            <p className="text-6xl font-bold font-mono text-accent">{raffle.winnerSlotNumber}</p>
            <p className="mt-2 font-semibold">
                ¡Felicidades, {raffle.slots.find(s => s.slotNumber === raffle.winnerSlotNumber)?.participantName || 'Ganador'}!
            </p>
          </div>
        ) : (
          <form action={handleFinalize}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" disabled={isPending}>
                  {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                      <Crown className="mr-2 h-4 w-4" />
                  )}
                  Sortear un Ganador
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción es irreversible. Seleccionará al azar un
                    ganador de entre las 100 casillas y finalizará la rifa. No podrás
                    realizar más cambios.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <FinalizeButton />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
