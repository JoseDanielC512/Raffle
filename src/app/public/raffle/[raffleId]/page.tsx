'use client';

import { useEffect, useState, use } from 'react';
import { notFound } from 'next/navigation';
import { doc, onSnapshot, collection } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Raffle, RaffleSlot } from '@/lib/definitions';
import RaffleBoard from '@/components/raffle/raffle-board';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function RafflePageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Board Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[150px] w-full rounded-lg" />
      </div>
      {/* Legend Skeleton */}
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export default function PublicRafflePage({ params }: { params: Promise<{ raffleId: string }> }) {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [slots, setSlots] = useState<RaffleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  // Listener en tiempo real para la rifa
  useEffect(() => {
    if (!resolvedParams.raffleId) {
      return;
    }

    const raffleRef = doc(db, 'raffles', resolvedParams.raffleId);
    const unsubscribe = onSnapshot(
      raffleRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const raffleData = { id: docSnap.id, ...docSnap.data() } as Raffle;
          setRaffle(raffleData);
          if (loading) setLoading(false);
        } else {
          notFound();
        }
      },
      (error) => {
        // Si hay error de permisos, la rifa no existe o no es pública
        notFound();
      }
    );

    return () => {
      unsubscribe();
    };
  }, [resolvedParams.raffleId, loading]);

  // Listener en tiempo real para los slots
  useEffect(() => {
    if (!resolvedParams.raffleId) {
      return;
    }

    const slotsColRef = collection(db, 'raffles', resolvedParams.raffleId, 'slots');
    const unsubscribe = onSnapshot(
      slotsColRef,
      (snapshot) => {
        const slotsData = snapshot.docs
          .map((doc) => doc.data() as RaffleSlot)
          .sort((a, b) => a.slotNumber - b.slotNumber);
        setSlots(slotsData);
        setLoading(false);
      },
      (error) => {
        // Si hay error de permisos, la rifa no existe o no es pública
        notFound();
      }
    );

    return () => {
      unsubscribe();
    };
  }, [resolvedParams.raffleId]);

  if (loading || !raffle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <RafflePageSkeleton />
        </div>
      </div>
    );
  }

  const paidSlots = slots.filter((slot) => slot.status === 'paid').length;

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
                  Vista Pública de la Rifa: {raffle.name}
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
            <Card className="bg-gradient-to-br from-background to-muted/10 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Términos y Condiciones
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {raffle.terms}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-muted/10 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  Información de la Rifa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Estado:</span>
                  <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                    raffle.finalizedAt
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {raffle.finalizedAt ? 'Finalizada' : 'Activa'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Casillas totales:</span>
                  <span className="text-xs sm:text-sm font-medium">100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Casillas pagadas:</span>
                  <span className="text-xs sm:text-sm font-medium">{paidSlots}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
