'use client';

import Link from "next/link";
import { PlusCircle, DollarSign, Ticket, Trophy, ListChecks } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { Raffle, RaffleSlot } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { RaffleTable } from "@/components/raffle/raffle-table";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrencyCOP } from "@/lib/utils";

function DashboardSkeleton() {
  return (
    <div className="mt-8">
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [rafflesData, setRafflesData] = useState<(Raffle & { id: string })[]>([]);
  const [raffleSlots, setRaffleSlots] = useState<{ [raffleId: string]: RaffleSlot[] }>({});
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  // Effect for fetching raffles
  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading) setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const rafflesQuery = query(collection(db, 'raffles'), where('ownerId', '==', user.uid));
    
    const raffleUnsubscribe = onSnapshot(rafflesQuery, (querySnapshot) => {
      const fetchedRaffles: (Raffle & { id: string })[] = [];
      if (querySnapshot.empty) {
        setRafflesData([]);
        setRaffleSlots({}); // Clear slots when no raffles
        setDataLoading(false);
        return;
      }
      querySnapshot.forEach((doc) => {
        const raffleData = { id: doc.id, ...doc.data() } as Raffle & { id: string };
        fetchedRaffles.push(raffleData);
      });
      setRafflesData(fetchedRaffles);
      setDataLoading(false);
    }, () => {
      // console.error("Error listening to raffles: ", error); // Removed for production
      toast({ title: "Error al Cargar Datos", description: "No se pudieron cargar los datos del dashboard.", variant: "destructive" });
      setDataLoading(false);
    });

    return () => {
      raffleUnsubscribe();
    };
  }, [user, authLoading, toast]); // Removed rafflesData from dependencies

  // Effect for fetching slots for each raffle
  useEffect(() => {
    const slotUnsubscribes: { [raffleId: string]: () => void } = {};

    if (rafflesData.length > 0) {
      rafflesData.forEach(raffle => {
        const raffleId = raffle.id;
        // Avoid creating duplicate subscriptions if one already exists for this raffleId
        if (!slotUnsubscribes[raffleId]) {
          const slotsRef = collection(db, 'raffles', raffleId, 'slots');
          const slotUnsubscribe = onSnapshot(slotsRef, (slotsSnapshot) => {
            const slotsData: RaffleSlot[] = [];
            slotsSnapshot.forEach(slotDoc => {
              slotsData.push({ id: slotDoc.id, ...slotDoc.data() } as unknown as RaffleSlot);
            });
            setRaffleSlots(prev => ({ ...prev, [raffleId]: slotsData }));
          });
          slotUnsubscribes[raffleId] = slotUnsubscribe;
        }
      });
    }

    return () => {
      Object.values(slotUnsubscribes).forEach(unsub => unsub());
    };
  }, [rafflesData]); // This effect depends on rafflesData

  const { raffles, ...stats } = useMemo(() => {
    const calculatedRaffles = rafflesData.map((raffle: Raffle & { id: string }) => {
      const slots = raffleSlots[raffle.id] || [];
      const filledSlots = slots.filter(s => s.status === 'paid' || s.status === 'reserved').length;
      let winnerName: string | undefined;
      if (raffle.finalizedAt && raffle.winnerSlotNumber) {
        const winnerSlot = slots.find(s => s.slotNumber === raffle.winnerSlotNumber);
        winnerName = winnerSlot?.participantName || 'No asignado';
      }
      return { ...raffle, filledSlots, winnerName };
    });

    const activeRafflesCount = calculatedRaffles.filter(r => r.status === 'active').length;
    const completedRafflesCount = calculatedRaffles.filter(r => r.status === 'finalized').length;
    const totalSoldSlots = calculatedRaffles.reduce((sum, r) => sum + r.filledSlots, 0);
    const potentialRevenue = calculatedRaffles.reduce((sum, r) => sum + (r.filledSlots * r.slotPrice), 0);

    return {
      raffles: calculatedRaffles,
      activeRafflesCount,
      completedRafflesCount,
      totalSoldSlots,
      potentialRevenue,
      canCreateRaffle: activeRafflesCount < 2,
    };
  }, [rafflesData, raffleSlots]);

  const isLoading = authLoading || dataLoading;

  return (
    <div className="space-y-6">
      <DashboardHeader canCreateRaffle={stats.canCreateRaffle} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-3">
          {isLoading ? (
            <DashboardSkeleton />
          ) : raffles.length > 0 ? (
            <RaffleTable raffles={raffles} />
          ) : (
            <div className="text-center py-16 md:py-24 bg-card border-2 border-dashed border-border rounded-xl shadow-soft">
              <h2 className="text-2xl font-semibold text-secondary mb-4">¡Aún no hay rifas!</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Comienza tu primera rifa para empezar a vender casillas.
              </p>
              {stats.canCreateRaffle && (
                <Button asChild>
                  <Link href="/raffle/create">
                    <PlusCircle className="mr-2 h-4 w-4" /> Crear mi Primera Rifa
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>

        <motion.aside 
          className="lg:col-span-1 grid grid-cols-2 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <StatCard 
            title="Rifas Activas" 
            value={stats.activeRafflesCount} 
            description="de 2 permitidas" 
            icon={<ListChecks className="h-4 w-4 text-muted-foreground" />} 
            isLoading={isLoading}
          />
          <StatCard 
            title="Rifas Completadas" 
            value={stats.completedRafflesCount} 
            icon={<Trophy className="h-4 w-4 text-muted-foreground" />} 
            isLoading={isLoading}
          />
          <StatCard 
            title="Casillas Vendidas" 
            value={stats.totalSoldSlots} 
            description="en todas tus rifas" 
            icon={<Ticket className="h-4 w-4 text-muted-foreground" />} 
            isLoading={isLoading}
          />
          <StatCard 
            title="Ingresos Potenciales" 
            value={formatCurrencyCOP(stats.potentialRevenue)} 
            description="basado en casillas vendidas" 
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} 
            isLoading={isLoading}
          />
        </motion.aside>
      </div>
    </div>
  );
}
