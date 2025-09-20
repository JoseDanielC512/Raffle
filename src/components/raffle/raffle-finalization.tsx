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
import { Crown, Loader2, PartyPopper, Trophy, AlertTriangle } from 'lucide-react';
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
      <Card className="bg-gradient-to-br from-background to-muted/10 border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline">Finalizar Rifa</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[100px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (raffle.finalizedAt) {
    const winnerSlot = slots.find((s: any) => s.slotNumber === raffle.winnerSlotNumber);
    const winnerName = winnerSlot?.participantName || 'Ganador';

    return (
      <Card className="bg-gradient-to-br from-background to-green-50/30 border-green-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-green-700 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            ¡Rifa Completada!
          </CardTitle>
          <CardDescription className="text-green-600">
            Se ha seleccionado un ganador exitosamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200/50">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="h-10 w-10 text-amber-900" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <PartyPopper className="h-4 w-4 text-white" />
              </div>
            </div>

            <p className="text-sm text-green-700 mb-2 font-medium">El número ganador es</p>
            <p className="text-5xl font-bold font-mono text-green-800 mb-4 drop-shadow-sm">
              {raffle.winnerSlotNumber}
            </p>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200/50 shadow-sm">
              <p className="text-lg font-semibold text-green-800 text-center">
                ¡Felicidades, <span className="text-green-900">{winnerName}</span>!
              </p>
              <p className="text-sm text-green-700 text-center mt-1">
                Has ganado esta rifa
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isOwner) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/10 border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-muted-foreground">Finalizar Rifa</CardTitle>
          <CardDescription>Solo el organizador puede finalizar la rifa.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-xl bg-muted/5">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              No tienes permiso para finalizar esta rifa.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Solo el organizador puede realizar esta acción.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background to-muted/10 border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-primary flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Finalizar Rifa
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Sortea un ganador al azar para finalizar la rifa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Advertencia importante</p>
                <p className="text-xs text-amber-700 mt-1">
                  Esta acción es irreversible. Se seleccionará un ganador al azar de las casillas pagadas y la rifa se finalizará permanentemente.
                </p>
              </div>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Finalizar Rifa
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gradient-to-br from-background to-muted/10 border-primary/20">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  ¿Estás absolutamente seguro?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Esta acción es irreversible. Se seleccionará un ganador al azar de las casillas pagadas y la rifa se finalizará. No podrás realizar más cambios.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-muted/50 transition-colors">
                  Cancelar
                </AlertDialogCancel>
                <Button
                  disabled={isPending}
                  onClick={handleFinalize}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finalizando...
                    </>
                  ) : (
                    "Confirmar Finalización"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
