'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot, collection, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Raffle, RaffleSlot } from '@/lib/definitions';
import RaffleBoard from '@/components/raffle/raffle-board';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

// Skeleton component for initial loading
function PublicRaffleSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg mt-8" />
      </div>
    </div>
  );
}

export default function PublicRafflePage() {
  const params = useParams<{ raffleId: string }>();
  const { raffleId } = params;
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [slots, setSlots] = useState<RaffleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!raffleId) return;
    const raffleRef = doc(db, 'raffles', raffleId);
    const raffleUnsubscribe = onSnapshot(raffleRef, (docSnap) => {
      if (docSnap.exists()) {
        setRaffle({ id: docSnap.id, ...docSnap.data() } as Raffle);
      } else {
        setError('Esta rifa no existe o ha sido eliminada.');
        setRaffle(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching raffle:", err);
      setError('No se pudo cargar la rifa.');
      setLoading(false);
    });

    const slotsQuery = query(collection(db, 'raffles', raffleId, 'slots'));
    const slotsUnsubscribe = onSnapshot(slotsQuery, (querySnapshot) => {
      const slotsData = querySnapshot.docs.map(doc => ({ ...doc.data() } as RaffleSlot));
      setSlots(slotsData);
    });

    return () => {
      raffleUnsubscribe();
      slotsUnsubscribe();
    };
  }, [raffleId]);

  if (loading) {
    return <PublicRaffleSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-destructive">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!raffle) {
    return null; // Should be handled by error state
  }

  const isFinalized = raffle.status === 'finalized';
  const winnerSlot = isFinalized ? slots.find(s => s.slotNumber === raffle.winnerSlotNumber) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card/80 backdrop-blur-sm border-border/60 shadow-md transition-all duration-300">
          <CardHeader className="bg-muted/30 rounded-t-lg border-b border-border/50 pb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground transition-colors duration-200">
                {raffle.name}
              </CardTitle>
              <Badge variant={isFinalized ? "destructive" : "secondary"} className="text-sm">
                {isFinalized ? "Finalizada" : "Activa"}
              </Badge>
            </div>
            <CardDescription className="pt-2 text-base">{raffle.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <RaffleBoard raffle={raffle} slots={slots} isOwner={false} />
          </CardContent>
          {isFinalized && (
            <CardFooter className="bg-muted/30 rounded-b-lg border-t border-border/50 p-4">
              <div className="w-full text-center">
                <h3 className="font-semibold text-primary flex items-center justify-center gap-2 text-lg">
                  <Crown className="h-5 w-5 text-amber-500" />
                  ¡Rifa Finalizada!
                </h3>
                {winnerSlot ? (
                  <p className="text-muted-foreground mt-1">
                    El ganador es <span className="font-bold text-primary">{winnerSlot.participantName}</span> con la casilla número <span className="font-bold text-primary">{raffle.winnerSlotNumber}</span>.
                  </p>
                ) : (
                  <p className="text-muted-foreground mt-1">
                    El ganador será anunciado pronto.
                  </p>
                )}
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
