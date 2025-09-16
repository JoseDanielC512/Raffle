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
          Drawing Winner...
        </>
      ) : (
        "Yes, Draw the Winner"
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
          {raffle.finalizedAt ? 'Raffle Complete!' : 'Finalize Raffle'}
        </CardTitle>
        <CardDescription>
          {raffle.finalizedAt
            ? 'A winner has been selected.'
            : 'Draw a random winner to finalize the raffle.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {raffle.winnerSlotNumber ? (
          <div className="flex flex-col items-center justify-center p-6 bg-accent/10 rounded-lg">
            <PartyPopper className="h-12 w-12 text-accent" />
            <p className="text-sm text-muted-foreground mt-4">The winning number is</p>
            <p className="text-6xl font-bold font-mono text-accent">{raffle.winnerSlotNumber}</p>
            <p className="mt-2 font-semibold">
                Congratulations, {raffle.slots.find(s => s.slotNumber === raffle.winnerSlotNumber)?.participantName || 'Winner'}!
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
                  Draw a Winner
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action is irreversible. It will randomly select a
                    winner from all 100 slots and finalize the raffle. You will
                    not be able to make any more changes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
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
