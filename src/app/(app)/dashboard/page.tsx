'use client';

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getRafflesForUser, countActiveRafflesForUser } from "@/lib/firestore";
import RaffleCard from "@/components/raffle/raffle-card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { Raffle } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const router = useRouter();
  const [raffles, setRaffles] = useState<(Raffle & { filledSlots: number })[]>([]);
  const [activeRafflesCount, setActiveRafflesCount] = useState(0);
  const [totalSoldSlots, setTotalSoldSlots] = useState(0);
  const [canCreateRaffle, setCanCreateRaffle] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDashboardData() {
      console.log("fetchDashboardData called. User:", user);
      if (user) {
        setDataLoading(true);
        console.log("Fetching raffles for user UID:", user.uid);
        const userRaffles = await getRafflesForUser(user.uid);
        console.log("User Raffles fetched:", userRaffles);
        const activeCount = await countActiveRafflesForUser(user.uid);
        console.log("Active Raffles Count:", activeCount);
        
        const totalSold = userRaffles.reduce((sum, raffle) => sum + raffle.filledSlots, 0);
        console.log("Total Sold Slots:", totalSold);

        setRaffles(userRaffles);
        setActiveRafflesCount(activeCount);
        setTotalSoldSlots(totalSold);
        const canCreate = activeCount < 2;
        setCanCreateRaffle(canCreate);
        console.log("Can Create Raffle:", canCreate);
        setDataLoading(false);
      } else {
        console.log("fetchDashboardData: No user found.");
      }
    }

    console.log("Dashboard useEffect triggered. authLoading:", authLoading, "user:", user);
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [user, authLoading, toast]);

  const isLoading = authLoading || dataLoading;

  console.log("--- Dashboard Render ---");
  console.log("authLoading:", authLoading);
  console.log("dataLoading:", dataLoading);
  console.log("isLoading:", isLoading);
  console.log("user:", user);
  console.log("activeRafflesCount:", activeRafflesCount);
  console.log("canCreateRaffle:", canCreateRaffle);
  console.log("------------------------");

  return (
    <div className="relative">
      {/* Analytics Summary */}
      {!isLoading && user && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rifas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRafflesCount}</div>
              <p className="text-xs text-muted-foreground">
                de 2 permitidas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Casillas Vendidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSoldSlots}</div>
              <p className="text-xs text-muted-foreground">
                en todas tus rifas
              </p>
            </CardContent>
          </Card>
          {/* Add more summary cards here if needed */}
        </div>
      )}

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
          {canCreateRaffle ? (
            <Button asChild>
              <Link href="/raffle/create">Crear una Rifa</Link>
            </Button>
          ) : (
             <Button disabled className="cursor-not-allowed">No puedes crear más rifas</Button>
          )}
        </div>
      )}

      {/* Mobile FAB */}
      {canCreateRaffle && (
        <Button 
          className="fixed bottom-4 right-4 md:hidden bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg"
          onClick={() => router.push('/raffle/create')}
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
