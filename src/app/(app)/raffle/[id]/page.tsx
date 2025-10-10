'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, WifiOff, Share2, Trophy, Info } from 'lucide-react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { motion } from "framer-motion";

import { db } from '@/lib/firebase';
import type { Raffle, RaffleSlot, RaffleActivity } from '@/lib/definitions';
import RaffleBoard from '@/components/raffle/raffle-board';
import RaffleInfoDialog from '@/components/raffle/RaffleInfoDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import EditRaffleDialog from '@/components/raffle/EditRaffleDialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IconButton } from '@/components/ui/icon-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import DeclareWinnerDialog from '@/components/raffle/DeclareWinnerDialog';

// Función para truncar texto solo para visualización
const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

function RafflePageSkeleton() {

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
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

  // Lógica para determinar si se puede finalizar la rifa
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a mediodía para comparar solo fechas

  const isFinalizationDate =
    raffle.finalizationDate &&
    new Date(raffle.finalizationDate).toDateString() === today.toDateString();

  const canFinalize = isOwner && !raffle.finalizedAt && isFinalizationDate;

  const handleConfirmFinalize = () => {
    setShowConfirmDialog(false);
    setShowWinnerDialog(true);
  };

  const handleFinalizationSuccess = () => {
    // Show success toast
    toast({
      title: "¡Rifa finalizada!",
      description: "La rifa ha sido finalizada exitosamente y el ganador ha sido declarado.",
      variant: "success",
    });
  };

  const handleFinalizeRaffle = () => {
    if (!canFinalize) {
      if (!isFinalizationDate) {
        toast({
          title: 'Fecha no válida',
          description: 'Solo puedes finalizar la rifa en la fecha de finalización programada.',
          variant: 'destructive',
        });
      } else if (!isOwner) {
        toast({
          title: 'Permiso denegado',
          description: 'Solo el propietario puede finalizar la rifa.',
          variant: 'destructive',
        });
      }
      return;
    }
    setShowConfirmDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <IconButton
          onClick={() => router.push('/dashboard')}
          icon={<ArrowLeft className="h-5 w-5" />}
          tooltip="Volver al Dashboard"
          tooltipSide="bottom"
          aria-label="Volver al dashboard"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold font-headline truncate">{raffle.name}</h1>
          <p className="text-primario-oscuro/60 text-sm md:text-base mt-1">
            {truncateText(raffle.description, 150)}
          </p>
        </div>
        
        {/* Action Menu - Only visible to owner */}
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                icon={
                  <motion.span 
                    className="text-white text-xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    🎲
                  </motion.span>
                }
                tooltip="Acciones de la rifa"
                tooltipSide="bottom"
                aria-label="Acciones de la rifa"
                className="bg-gradient-icon hover:scale-105 text-white border-acento-fuerte/30 shadow-lg hover:shadow-xl transition-all duration-300"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              <DropdownMenuItem onClick={handleCopyPublicUrl}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartir rifa
              </DropdownMenuItem>
              
              {!raffle.finalizedAt && (
                <EditRaffleDialog
                  raffleId={raffle.id}
                  currentName={raffle.name}
                  currentDescription={raffle.description}
                  currentSlotPrice={raffle.slotPrice}
                  currentFinalizationDate={raffle.finalizationDate}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar rifa
                  </DropdownMenuItem>
                </EditRaffleDialog>
              )}
              
              <DropdownMenuItem onClick={handleFinalizeRaffle}>
                <Trophy className="mr-2 h-4 w-4" />
                Finalizar rifa
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => router.push(`/raffle/${resolvedParams.id}/details`)}>
                <Info className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Indicador de Conexión */}
      {!isLiveConnected && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Conexión en tiempo real perdida. Los datos podrían no estar actualizados. Por favor, revisa tu conexión a internet o desactiva extensiones del navegador que puedan bloquear la conexión.
          </AlertDescription>
        </Alert>
      )}

      {/* Tablero Full-Width */}
      <section className="w-full">
        <RaffleBoard
          raffle={raffle}
          slots={slots}
          isOwner={isOwner}
          onSlotUpdate={handleSlotUpdate}
        />
      </section>


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

      {/* Diálogo de Confirmación para Finalizar Rifa */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-xs min-h-[40vh] p-4 sm:p-6 sm:max-w-[425px] rounded-lg bg-background border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-primario-oscuro">
              <AlertTriangle className="h-5 w-5" />
              ¿Estás absolutamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción es irreversible. Una vez que declares el ganador, la rifa se
              finalizará permanentemente y no podrás realizar más cambios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-y-2 sm:space-y-0">
            <AlertDialogCancel className="w-full sm:w-auto mt-4 sm:mt-0">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmFinalize}
              className="w-full sm:w-auto"
            >
              Sí, finalizar rifa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para Declarar Ganador */}
      <DeclareWinnerDialog
        raffleId={raffle.id}
        open={showWinnerDialog}
        onOpenChange={setShowWinnerDialog}
        onSuccess={handleFinalizationSuccess}
      />
    </div>
  );
}
