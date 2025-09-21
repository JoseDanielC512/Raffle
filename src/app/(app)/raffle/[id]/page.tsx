'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { doc, onSnapshot, collection, getDoc } from 'firebase/firestore';

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
import RaffleFinalization from '@/components/raffle/raffle-finalization';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import EditRaffleDialog from '@/components/raffle/EditRaffleDialog';

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

export default function RafflePage({ params }: { params: Promise<{ id: string }> }) {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [slots, setSlots] = useState<RaffleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);

  const paidSlots = slots.filter((slot) => slot.status === 'paid').length;

  const handleSlotUpdate = useCallback((slotNumber: number, updates: Partial<RaffleSlot>) => {
    setSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.slotNumber === slotNumber ? { ...slot, ...updates } : slot
      )
    );
  }, []);

  // Verificar autenticación y redirigir si es necesario
  useEffect(() => {
    if (!authLoading && !user) {
      // Usuario no autenticado, redirigir al login
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  // Listener en tiempo real para la rifa
  useEffect(() => {
    if (authLoading || !user || !resolvedParams.id) return;

    const raffleRef = doc(db, 'raffles', resolvedParams.id);
    const unsubscribe = onSnapshot(
      raffleRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const raffleData = { id: docSnap.id, ...docSnap.data() } as Raffle;
          setRaffle(raffleData);
          // Set loading false after first raffle load (slots will also set it)
          if (loading) setLoading(false);
        } else {
          notFound();
        }
      },
      (error) => {
        console.error('Error listening to raffle:', error);
        // Si hay error de permisos, redirigir al login
        if (error instanceof Error && error.message.includes('permission-denied')) {
          router.push('/login');
        }
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [resolvedParams.id, user, authLoading, router, loading]);

  // Solo configurar el listener de slots cuando la autenticación esté completa
  useEffect(() => {
    if (authLoading || !user || !resolvedParams.id) return;

    const slotsColRef = collection(db, 'raffles', resolvedParams.id, 'slots');
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
        console.error('Error listening to slots:', error);
        // Si hay error de permisos en el listener, redirigir al login
        if (error instanceof Error && error.message.includes('permission-denied')) {
          router.push('/login');
        }
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [resolvedParams.id, user, authLoading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Verificando autenticación...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No renderizar nada si no hay usuario (será redirigido)
  if (!user) {
    return null;
  }

  if (loading || !raffle) {
    return <RafflePageSkeleton />;
  }

  const isOwner = user?.uid === raffle.ownerId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:px-8 lg:px-12 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-border/50">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200 group"
                aria-label="Volver al dashboard"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
              </button>

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

              {/* Edit Button - Only visible to owner and if raffle is not finalized */}
              {user?.uid === raffle.ownerId && !raffle.finalizedAt && (
                <div className="ml-auto">
                  <EditRaffleDialog
                    raffleId={raffle.id}
                    currentName={raffle.name}
                    currentDescription={raffle.description}
                  >
                    <button
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200 group"
                      aria-label="Editar rifa"
                    >
                      <Pencil className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                    </button>
                  </EditRaffleDialog>
                </div>
              )}

            </div>

            
          </div>
        </div>

        <div className="space-y-8">
          {/* Tablero Full-Width */}
          <section className="w-full">
            <RaffleBoard raffle={raffle} slots={slots} isOwner={isOwner} onSlotUpdate={handleSlotUpdate} />
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
                <CardTitle className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
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
                  <span className="text-xs sm:text-sm text-muted-foreground">Creada por:</span>
                  <span className="text-xs sm:text-sm font-medium">Organizador</span>
                </div>
              </CardContent>
            </Card>

            {/* Mostrar el panel de finalización solo si el usuario es el dueño de la rifa 
            {user?.uid === raffle.ownerId && (
              <div className="lg:ml-auto self-start">
              <RaffleFinalization raffle={raffle} slots={slots} />
              </div>
            )}
            */}
          </div>
        </div>
      </div>
    </div>
  );
}
