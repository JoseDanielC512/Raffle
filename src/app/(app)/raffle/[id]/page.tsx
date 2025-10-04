'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Link, WifiOff } from 'lucide-react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { motion } from "framer-motion";

import { db } from '@/lib/firebase';
import type { Raffle, RaffleSlot, RaffleActivity } from '@/lib/definitions';
import RaffleBoard from '@/components/raffle/raffle-board';
import RaffleInfoDialog from '@/components/raffle/RaffleInfoDialog';
import ActivityHistory from '@/components/raffle/activity-history';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import EditRaffleDialog from '@/components/raffle/EditRaffleDialog';
import FinalizeRaffleButton from '@/components/raffle/FinalizeRaffleButton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IconButton } from '@/components/ui/icon-button';

function RafflePageSkeleton() {
  return (
    <div className="min-h-screen relative overflow-y-auto bg-gradient-raffle text-primario-oscuro">
      {/* Animated CSS Background - Same as public view */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/10 to-black/40 animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIgZD0iTTM2IDM0djJoLTJ2LTJoMnYyem0wLTR2MmgtMnYtMmgydjJ6bTAtNHYyaC0ydi0yaDJ2MnpNNDggNDh2LTJoLTJ2LTJoMnYyem0wLTR2MmgtMnYtMmgydjJ6bTAtNHYyaC0ydi0yaDJ2MnoiLz48L2c+PC9zdmc+')] opacity-20"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 md:px-8 lg:px-12 max-w-7xl space-y-12">
        {/* Header Skeleton */}
        <div className="flex flex-row flex-wrap items-center gap-4 pb-6 border-b border-border/50">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="space-y-3 flex-1 min-w-0">
              <Skeleton className="h-10 w-3/4 rounded" />
              <Skeleton className="h-6 w-full rounded" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Board Skeleton */}
          <section className="w-full">
            <div className="relative">
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-xl"></div>
              <div className="bg-gradient-to-br from-background to-muted/10 backdrop-blur-lg border-border/20 shadow-2xl rounded-2xl overflow-hidden p-6 md:p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48 rounded" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                  <div className="grid grid-cols-10 gap-2 md:gap-3 max-w-3xl mx-auto">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-24 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function RafflePage({ params }: { params: Promise<{ id: string }> }) {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [slots, setSlots] = useState<RaffleSlot[]>([]);
  const [activities, setActivities] = useState<RaffleActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const { toast } = useToast();

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
        title: "Error de Rifa",
        description: "No se pudo generar el enlace, los datos de la rifa no están disponibles.",
      });
      return;
    }
    const publicUrl = `${window.location.origin}/public/raffle/${raffle.id}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace público de la rifa ha sido copiado al portapapeles.",
        variant: "info",
      });
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Error al Copiar Enlace",
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
          title: "Error de Conexión",
          description: "No se pudo conectar a la base de datos en tiempo real. Los datos podrían no estar actualizados. Por favor, revisa tu conexión a internet o desactiva extensiones que puedan bloquear la conexión.",
        });
        // Si hay error de permisos, redirigir al login
        if (error instanceof Error && error.message.includes('permission-denied')) {
          router.push('/login');
        }
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [resolvedParams.id, user, authLoading, router, loading, toast]);

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
        if (!loading && !activitiesLoading) {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error en listener de casillas:", error);
        setIsLiveConnected(false);
        toast({
          variant: "destructive",
          title: "Error de Conexión",
          description: "No se pudo conectar a la base de datos en tiempo real. Los datos podrían no estar actualizados. Por favor, revisa tu conexión a internet o desactiva extensiones que puedan bloquear la conexión.",
        });
        // Si hay error de permisos en el listener, redirigir al login
        if (error instanceof Error && error.message.includes('permission-denied')) {
          router.push('/login');
        }
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [resolvedParams.id, user, authLoading, router, toast, loading, activitiesLoading]);

  // Listener en tiempo real para el historial de actividades
  useEffect(() => {
    if (authLoading || !user || !resolvedParams.id) return;

    const activitiesColRef = collection(db, 'raffles', resolvedParams.id, 'activity');
    const unsubscribe = onSnapshot(
      activitiesColRef,
      (snapshot) => {
        const activitiesData = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as RaffleActivity)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by timestamp (newest first)
        setActivities(activitiesData);
        setActivitiesLoading(false);
        if (!loading && !activitiesLoading) {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error en listener de actividades:", error);
        setIsLiveConnected(false);
        toast({
          variant: "destructive",
          title: "Error de Conexión",
          description: "No se pudo conectar a la base de datos en tiempo real. Los datos podrían no estar actualizados. Por favor, revisa tu conexión a internet o desactiva extensiones que puedan bloquear la conexión.",
        });
        setActivitiesLoading(false);
        if (!loading && !activitiesLoading) {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [resolvedParams.id, user, authLoading, router, loading, toast, activitiesLoading]);

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
    <div className="min-h-screen relative overflow-y-auto bg-gradient-raffle text-primario-oscuro">
      {/* Animated CSS Background - Same as public view */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/10 to-black/40 animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIgZD0iTTM2IDM0djJoLTJ2LTJoMnYyem0wLTR2MmgtMnYtMmgydjJ6bTAtNHYyaC0ydi0yaDJ2MnpNNDggNDh2LTJoLTJ2LTJoMnYyem0wLTR2MmgtMnYtMmgydjJ6bTAtNHYyaC0ydi0yaDJ2MnoiLz48L2c+PC9zdmc+')] opacity-20"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 md:px-8 lg:px-12 max-w-7xl space-y-12">
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
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pb-8 border-b border-primario-oscuro/20"
        >
          <div className="flex items-center gap-6 flex-wrap">
            {/* Back Button */}
            <IconButton
              onClick={() => router.push('/dashboard')}
              icon={<ArrowLeft className="h-5 w-5" />}
              tooltip="Volver al Dashboard"
              tooltipSide="bottom"
              aria-label="Volver al dashboard"
              className="bg-acento-fuerte/10 hover:bg-acento-fuerte/20 text-primario-oscuro border-acento-fuerte/30 shadow-md hover:shadow-lg transition-all duration-300"
            />

            {/* Animated Icon */}
            <motion.div 
              className="w-20 h-20 bg-gradient-icon rounded-2xl flex items-center justify-center shadow-2xl shadow-acento-fuerte/50 flex-shrink-0"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.1, rotate: 15, transition: { duration: 0.3 } }}
            >
              <motion.span 
                className="text-white text-3xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                🎲
              </motion.span>
            </motion.div>
            
            <div className="space-y-2 flex-1 min-w-0">
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline bg-gradient-text drop-shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                {raffle.name}
              </motion.h1>
              <motion.p 
                className="text-lg sm:text-xl text-primario-oscuro/80 leading-relaxed font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {raffle.description}
              </motion.p>
            </div>
          </div>

          {/* Action Buttons Group - Only visible to owner */}
          {isOwner && (
            <motion.div 
              className="flex items-center gap-3 flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              {/* Copy Link Button */}
              <IconButton
                onClick={handleCopyPublicUrl}
                icon={<Link className="h-5 w-5" />}
                tooltip="Copiar enlace público"
                tooltipSide="bottom"
                aria-label="Copiar enlace público"
                className="bg-acento-calido/10 hover:bg-acento-calido/20 text-primario-oscuro border-acento-calido/30 shadow-md hover:shadow-lg transition-all duration-300"
              />

              {/* Edit Button - Only visible if raffle is not finalized */}
              {!raffle.finalizedAt && (
                <EditRaffleDialog
                  raffleId={raffle.id}
                  currentName={raffle.name}
                  currentDescription={raffle.description}
                  currentSlotPrice={raffle.slotPrice}
                  currentFinalizationDate={raffle.finalizationDate}
                >
                  <IconButton
                    icon={<Pencil className="h-5 w-5" />}
                    tooltip="Editar rifa"
                    tooltipSide="bottom"
                    aria-label="Editar rifa"
                    className="bg-acento-fuerte/10 hover:bg-acento-fuerte/20 text-primario-oscuro border-acento-fuerte/30 shadow-md hover:shadow-lg transition-all duration-300"
                  />
                </EditRaffleDialog>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Tablero Full-Width */}
        <section className="w-full">
          <RaffleBoard
            raffle={raffle}
            slots={slots}
            isOwner={isOwner}
            onSlotUpdate={handleSlotUpdate}
            onInfoClick={() => setIsInfoDialogOpen(true)}
          />
        </section>

        {/* Historial de Actividad */}
        <section className="w-full">
          <ActivityHistory activities={activities} />
        </section>

        {/* Panel de Finalización - Solo visible para el dueño en la fecha correcta */}
        {isOwner && (
          <div className="w-full">
            <FinalizeRaffleButton raffle={raffle} isOwner={isOwner} />
          </div>
        )}

        {/* Diálogo de Información de la Rifa */}
          <RaffleInfoDialog
            open={isInfoDialogOpen}
            onOpenChange={setIsInfoDialogOpen}
            terms={raffle.terms}
            slotPrice={raffle.slotPrice}
            ownerName={raffle.ownerName}
            winnerName={winnerName || undefined}
            winnerSlotNumber={raffle.winnerSlotNumber || undefined}
            isFinalized={!!raffle.finalizedAt}
          />
      </div>
    </div>
  );
}
