'use client';

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getRafflesForUser } from "@/lib/firestore"; // Updated import
import RaffleCard from "@/components/raffle/raffle-card";
import { useAuth } from "@/context/auth-context";
import type { Raffle } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-[250px] w-full rounded-lg" />
      <Skeleton className="h-[250px] w-full rounded-lg" />
      <Skeleton className="h-[250px] w-full rounded-lg" />
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [raffles, setRaffles] = useState<(Raffle & { filledSlots: number })[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchRaffles() {
      if (user) {
        setDataLoading(true);
        const userRaffles = await getRafflesForUser(user.uid);
        setRaffles(userRaffles);
        setDataLoading(false);
      }
    }

    if (!authLoading) {
      fetchRaffles();
    }
  }, [user, authLoading]);

  const isLoading = authLoading || dataLoading;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Tus Rifas</h1>
        <Button asChild>
          <Link href="/raffle/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva Rifa
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : raffles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {raffles.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">¡Aún no hay rifas!</h2>
          <p className="text-muted-foreground mb-4">
            Comienza creando tu primera rifa.
          </p>
          <Button asChild>
            <Link href="/raffle/create">Crear una Rifa</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
