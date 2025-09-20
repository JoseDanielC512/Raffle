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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">{raffle.name}</h1>
          <p className="text-muted-foreground mt-2">{raffle.description}</p>
        </div>
        <RaffleFinalization raffle={raffle} slots={slots} />
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
          {/* Pass slots directly to the board */}
          <RaffleBoard raffle={raffle} slots={slots} />
        </div>
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold">Términos y Condiciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{raffle.terms}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
