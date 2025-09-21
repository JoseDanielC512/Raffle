'use client';

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import RaffleCard from "@/components/raffle/raffle-card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { Raffle, RaffleSlot } from "@/lib/definitions";
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
  const pathname = usePathname();
  const [activeRafflesCount, setActiveRafflesCount] = useState(0);
  const [totalSoldSlots, setTotalSoldSlots] = useState(0);
  const [canCreateRaffle, setCanCreateRaffle] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();
  const [raffleSlots, setRaffleSlots] = useState<{ [raffleId: string]: RaffleSlot[] }>({});
  const [rafflesData, setRafflesData] = useState<(Raffle & { id: string })[]>([]);

  useEffect(() => {
    if (authLoading || !user) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const rafflesUnsubscribe: (() => void)[] = [];

    // Listener for user's raffles
    const rafflesQuery = query(collection(db, 'raffles'), where('ownerId', '==', user.uid));
    const rafflesUnsubscribeMain = onSnapshot(rafflesQuery, (querySnapshot) => {
      const rafflesData: (Raffle & { id: string })[] = [];
      querySnapshot.forEach((doc) => {
        rafflesData.push({ id: doc.id, ...doc.data() } as Raffle & { id: string });
      });

      // Update active raffle count
      const activeCount = rafflesData.filter(r => r.status === 'active').length;
      setActiveRafflesCount(activeCount);
      setCanCreateRaffle(activeCount < 2);
      setRafflesData(rafflesData);

      // Set up listeners for slots for each raffle
      rafflesData.forEach(raffleDoc => {
        const slotsRef = collection(db, 'raffles', raffleDoc.id, 'slots');
        const slotsUnsubscribe = onSnapshot(slotsRef, (slotsSnapshot) => {
          const slotsData: RaffleSlot[] = [];
          slotsSnapshot.forEach(slotDoc => {
            slotsData.push({ id: slotDoc.id, ...slotDoc.data() } as unknown as RaffleSlot);
          });
          
          setRaffleSlots(prev => ({
            ...prev,
            [raffleDoc.id]: slotsData
          }));
        });
        rafflesUnsubscribe.push(slotsUnsubscribe);
      });
      
      setDataLoading(false);
    }, (error) => {
      console.error("Error listening to raffles: ", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard en tiempo real.",
        variant: "destructive"
      });
      setDataLoading(false);
    });
    
    rafflesUnsubscribe.push(rafflesUnsubscribeMain);

    // Cleanup function
    return () => {
      rafflesUnsubscribe.forEach(unsubscribe => unsubscribe());
    };
  }, [user, authLoading, toast]); // Removed raffleSlots from dependency array

  const raffles = useMemo(() => {
    return rafflesData.map((raffle: Raffle & { id: string }) => {
      const slots = raffleSlots[raffle.id] || [];
      const filledSlots = slots.filter(s => s.status === 'paid' || s.status === 'reserved').length;
      let winnerName: string | undefined;
      if (raffle.finalizedAt && raffle.winnerSlotNumber) {
        const winnerSlot = slots.find(s => s.slotNumber === raffle.winnerSlotNumber);
        winnerName = winnerSlot?.participantName || 'No asignado';
      }
      return {
        ...raffle,
        filledSlots,
        winnerName,
      };
    });
  }, [rafflesData, raffleSlots]);

  useEffect(() => {
    const totalSold = raffles.reduce((sum: number, raffle: Raffle & { filledSlots: number; winnerName?: string }) => sum + raffle.filledSlots, 0);
    setTotalSoldSlots(totalSold);
  }, [raffles]);

  const isLoading = authLoading || dataLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8 lg:p-12">
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground tracking-tight">
          Panel de Control
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Gestiona tus rifas y visualiza su progreso.
        </p>
      </header>

      {/* Analytics Summary */}
      {!isLoading && user && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <Card className="bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="bg-muted/30 rounded-t-lg border-b border-border/50 pb-2">
              <CardTitle className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base">
                Rifas Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-primary group-hover:text-primary/90 transition-colors">
                {activeRafflesCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                de 2 permitidas
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="bg-muted/30 rounded-t-lg border-b border-border/50 pb-2">
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 flex items-center gap-2">
                Casillas Vendidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-primary group-hover:text-primary/90 transition-colors">
                {totalSoldSlots}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                en todas tus rifas
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Action Section - Create Raffle Button */}
      <div className="mb-8 md:mb-12 text-center flex justify-center" style={{ minHeight: '60px' }}>
        {isLoading ? (
          <Skeleton className="h-[52px] w-[240px] rounded-lg" />
        ) : user && canCreateRaffle ? (
          <Button
            asChild
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 transform hover:scale-105 min-w-[200px] px-8 py-4 text-base font-semibold"
          >
            <Link href="/raffle/create" className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Crear Nueva Rifa
            </Link>
          </Button>
        ) : user ? (
          <Button
            disabled
            size="lg"
            className="cursor-not-allowed bg-muted text-muted-foreground shadow-inner min-w-[200px] px-8 py-4 text-base font-semibold"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Límite de Rifas Alcanzado
          </Button>
        ) : null}
      </div>

      {/* Raffles List Section */}
      <section>
        {isLoading ? (
          <DashboardSkeleton />
        ) : raffles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-24 border-2 border-dashed border-muted rounded-xl bg-muted/10 backdrop-blur-sm hover:bg-muted/20 transition-all duration-300">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <PlusCircle className="h-12 w-12 text-primary/40" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold font-headline text-foreground mb-4">
              ¡Aún no hay rifas!
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Comienza tu primera rifa para empezar a vender casillas.
            </p>
            {canCreateRaffle ? (
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[200px] px-8 py-4 text-base font-semibold"
              >
                <Link href="/raffle/create" className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Crear mi Primera Rifa
                </Link>
              </Button>
            ) : (
              <Button
                disabled
                size="lg"
                className="cursor-not-allowed bg-muted text-muted-foreground shadow-inner min-w-[200px] px-8 py-4 text-base font-semibold"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                No puedes crear más rifas
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Mobile FAB */}
      {canCreateRaffle && !isLoading && (
        <Button
          className="fixed bottom-6 right-6 md:hidden bg-primary hover:bg-primary/90 text-white rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 z-50 transform hover:scale-110"
          onClick={() => router.push('/raffle/create')}
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
