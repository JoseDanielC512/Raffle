'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { doc, onSnapshot, collection } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { getRaffleById } from '@/lib/firestore';
import type { Raffle, RaffleSlot } from '@/lib/definitions';
import RaffleBoard from '@/components/raffle/raffle-board';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import RaffleFinalization from '@/components/raffle/raffle-finalization';
import { Skeleton } from '@/components/ui/skeleton';

function RafflePageSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2">
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
      <div className="md:col-span-1 space-y-6">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[150px] w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function RafflePage({ params }: { params: { id: string } }) {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [slots, setSlots] = useState<RaffleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRaffle() {
      const raffleData = await getRaffleById(params.id);
      if (raffleData) {
        setRaffle(raffleData);
      } else {
        notFound();
      }
    }
    fetchRaffle();
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;

    const slotsColRef = collection(db, 'raffles', params.id, 'slots');
    const unsubscribe = onSnapshot(slotsColRef, (snapshot) => {
      const slotsData = snapshot.docs
        .map((doc) => doc.data() as RaffleSlot)
        .sort((a, b) => a.slotNumber - b.slotNumber);
      setSlots(slotsData);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [params.id]);

  if (loading || !raffle) {
    return <RafflePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">🎲</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
                  {raffle.name}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {raffle.description}
                </p>
              </div>
            </div>
          </div>
          <div className="lg:w-80">
            <RaffleFinalization raffle={raffle} slots={slots} />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Tablero Principal */}
          <div className="lg:col-span-3">
            <RaffleBoard raffle={raffle} slots={slots} />
          </div>

          {/* Panel Lateral */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gradient-to-br from-background to-muted/10 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Términos y Condiciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {raffle.terms}
                </p>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card className="bg-gradient-to-br from-background to-muted/10 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  Información de la Rifa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    raffle.finalizedAt
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {raffle.finalizedAt ? 'Finalizada' : 'Activa'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Casillas totales:</span>
                  <span className="text-sm font-medium">100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Creada por:</span>
                  <span className="text-sm font-medium">Organizador</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
