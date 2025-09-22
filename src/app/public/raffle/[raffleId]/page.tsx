'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Raffle, RaffleSlot } from '@/lib/definitions';
import RaffleBoard from '@/components/raffle/raffle-board';
import RaffleTermsCard from '@/components/raffle/RaffleTermsCard';
import RaffleInfoCard from '@/components/raffle/RaffleInfoCard';
import { Skeleton } from '@/components/ui/skeleton';

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

    const slotsQuery = query(collection(db, 'raffles', raffleId, 'slots'), orderBy('slotNumber', 'asc'));
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:px-8 lg:px-12 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-border/50">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">🎲</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline text-foreground">
                  {raffle.name}
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                  {raffle.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Tablero Full-Width */}
          <section className="w-full">
            <RaffleBoard raffle={raffle} slots={slots} isOwner={false} />
          </section>

          {/* Panels en Grid Horizontal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RaffleTermsCard terms={raffle.terms} />
            <RaffleInfoCard raffle={raffle} winnerName={winnerSlot?.participantName} />
          </div>
        </div>
      </div>
    </div>
  );
}
