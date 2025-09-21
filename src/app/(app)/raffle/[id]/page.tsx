'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Link, Wifi, WifiOff, Crown } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import EditRaffleDialog from '@/components/raffle/EditRaffleDialog';
import FinalizeRaffleButton from '@/components/raffle/FinalizeRaffleButton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const { toast } = useToast();

  const paidSlots = slots.filter((slot) => slot.status === 'paid').length;

  const winnerName = raffle?.finalizedAt && raffle.winnerSlotNumber ? slots.find(slot => slot.slotNumber === raffle.winnerSlotNumber)?.participantName || 'No asignado' : null;

  const handleSlotUpdate = useCallback((slotNumber: number, updates: Partial<RaffleSlot>) => {
    setSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.slotNumber === slotNumber ? { ...slot, ...updates } : slot
      )
    );
  }, []);

  const handleCopyPublicUrl = useCallback(() => {
    if (!raffle || !raffle.id) {
      // Esto no debería ocurrir si el botón está visible, pero es una salvaguarda.
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el enlace, los datos de la rifa no están disponibles.",
      });
      return;
    }
    const publicUrl = `${window.location.origin}/public/raffle/${raffle.id}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace público de la rifa ha sido copiado al portapapeles.",
      });
    }).catch((err) => {
      toast({
        variant: "destructive",
        title: "Error al copiar",
        description: "No se pudo copiar el enlace al portapapeles.",
      });
    });
  }, [raffle, toast]); // Cambiado de raffle.id a raffle para satisfacer a TypeScript

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
        console.error("Error en listener de rafa:", error);
        setIsLiveConnected(false);
        toast({
          variant: "destructive",
          title: "Error de conexión",
          description: "No se pudo conectar a la base de datos en tiempo real. Los datos podrían no estar actualizados. Por favor, revisa tu conexión a internet o desactiva extensiones que puedan bloquear la conexión.",
        });
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
        console.error("Error en listener de casillas:", error);
        setIsLiveConnected(false);
        toast({
          variant: "destructive",
          title: "Error de conexión",
          description: "No se pudo conectar a la base de datos en tiempo real. Los datos podrían no estar actualizados. Por favor, revisa tu conexión a internet o desactiva extensiones que puedan bloquear la conexión.",
        });
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
        {/* Indicador de Conexión */}
        {!isLiveConnected && (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Conexión en tiempo real perdida. Los datos podrían no estar actualizados. Por favor, revisa tu conexión a internet o desactiva extensiones del navegador que puedan bloquear la conexión.
            </AlertDescription>
          </Alert>
        )}

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

              {/* Copy Link Button - Only visible to owner */}
              {isOwner && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPublicUrl}
                  className="ml-2"
                  aria-label="Copiar enlace público"
                >
                  <Link className="h-4 w-4" />
                </Button>
              )}

              {/* Edit Button - Only visible to owner and if raffle is not finalized */}
              {isOwner && !raffle.finalizedAt && (
                <div className="ml-auto">
                  <EditRaffleDialog
                    raffleId={raffle.id}
                    currentName={raffle.name}
                    currentDescription={raffle.description}
                    currentFinalizationDate={raffle.finalizationDate}
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
            {/* Card: Términos y Condiciones */}
            <Card className="flex flex-col bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="bg-muted/30 rounded-t-lg border-b border-border/50 pb-4">
                <CardTitle className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  Términos y Condiciones
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-grow max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-muted/10">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed tracking-tight">
                  {raffle.terms}
                </p>
              </CardContent>
            </Card>

            {/* Card: Información de la Rifa */}
            <Card className="flex flex-col bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="bg-muted/30 rounded-t-lg border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  Información de la Rifa
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 flex-grow">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Estado:</span>
                  <Badge variant={raffle.finalizedAt ? "destructive" : "secondary"} className="text-xs">
                    {raffle.finalizedAt ? 'Finalizada' : 'Activa'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Casillas totales:</span>
                  <span className="text-xs sm:text-sm font-medium">100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Creada por:</span>
                  <span className="text-xs sm:text-sm font-medium">Organizador</span>
                </div>
                
                {winnerName && (
                  <div 
                    className="mt-4 p-3 bg-amber-50/50 rounded-md space-y-2 border border-amber-200/50 transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2" 
                    role="region" 
                    aria-label="Detalles de rifa finalizada"
                  >
                    <p className="font-semibold text-primary flex items-center gap-2 text-sm">
                      <Crown className="h-4 w-4 text-amber-500" />
                      Slot Ganador: <span className="text-base font-bold text-amber-700">{raffle.winnerSlotNumber}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ganador: <span className="font-medium text-primary">{winnerName}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Panel de Finalización - Solo visible para el dueño en la fecha correcta */}
            {isOwner && (
              <div className="lg:col-span-2">
                <FinalizeRaffleButton raffle={raffle} isOwner={isOwner} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
