'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, User, Trophy, ScrollText, Info, TrendingUp, Clock, Users, Grid3X3, ShoppingCart, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { motion } from "framer-motion";

import { db } from '@/lib/firebase';
import type { Raffle, RaffleSlot, RaffleActivity } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { IconButton } from '@/components/ui/icon-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrencyCOP } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ActivityTimeline from '@/components/raffle/activity-timeline';
import { RaffleImageCarousel } from '@/components/raffle/RaffleImageCarousel';

// Función para truncar texto solo para visualización
const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

function RaffleDetailsPageSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
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
        {/* Hero Card Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[200px]">
              <CardHeader>
                <Skeleton className="h-6 w-40 rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-2/3 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="h-[96px]">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 rounded mb-2" />
                <Skeleton className="h-6 w-16 rounded" />
              </CardContent>
            </Card>
            <Card className="h-[96px]">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 rounded mb-2" />
                <Skeleton className="h-6 w-16 rounded" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-[140px]">
              <CardContent className="p-6">
                <div className="flex flex-col justify-between h-full">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-8 w-16 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Terms Card Skeleton */}
        <Card className="h-[250px]">
          <CardHeader>
            <Skeleton className="h-6 w-40 rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full rounded" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Skeleton */}
        <Card className="h-[400px]">
          <CardHeader>
            <Skeleton className="h-6 w-48 rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RaffleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [slots, setSlots] = useState<RaffleSlot[]>([]);
  const [activities, setActivities] = useState<RaffleActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const { toast } = useToast();

  const winnerName = raffle?.finalizedAt && raffle.winnerSlotNumber 
    ? slots.find(slot => slot.slotNumber === raffle.winnerSlotNumber)?.participantName || 'No asignado' 
    : null;

  // Verificar autenticación y redirigir si es necesario
  useEffect(() => {
    if (!authLoading && !user) {
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
          if (loading) setLoading(false);
        } else {
          notFound();
        }
      },
      (error) => {
        console.error("Error en listener de rifa:", error);
        toast({
          variant: "destructive",
          title: "Error de Conexión",
          description: "No se pudo conectar a la base de datos. Por favor, revisa tu conexión a internet.",
        });
        if (error instanceof Error && error.message.includes('permission-denied')) {
          router.push('/login');
        }
      }
    );

    return () => unsubscribe();
  }, [resolvedParams.id, user, authLoading, router, loading, toast]);

  // Listener para las casillas
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
        toast({
          variant: "destructive",
          title: "Error de Conexión",
          description: "No se pudo conectar a la base de datos. Por favor, revisa tu conexión a internet.",
        });
        if (error instanceof Error && error.message.includes('permission-denied')) {
          router.push('/login');
        }
      }
    );

    return () => unsubscribe();
  }, [resolvedParams.id, user, authLoading, router, toast, loading, activitiesLoading]);

  // Listener para el historial de actividades
  useEffect(() => {
    if (authLoading || !user || !resolvedParams.id) return;

    const activitiesColRef = collection(db, 'raffles', resolvedParams.id, 'activity');
    const unsubscribe = onSnapshot(
      activitiesColRef,
      (snapshot) => {
        const activitiesData = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as RaffleActivity)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(activitiesData);
        setActivitiesLoading(false);
        if (!loading && !activitiesLoading) {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error en listener de actividades:", error);
        toast({
          variant: "destructive",
          title: "Error de Conexión",
          description: "No se pudo conectar a la base de datos. Por favor, revisa tu conexión a internet.",
        });
        setActivitiesLoading(false);
        if (!loading && !activitiesLoading) {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
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
    return <RaffleDetailsPageSkeleton />;
  }

  const isOwner = user?.uid === raffle.ownerId;
  const filledSlots = slots.filter(s => s.status === 'paid' || s.status === 'reserved').length;
  const potentialRevenue = filledSlots * raffle.slotPrice;

  // Obtener URLs de imágenes reales de la rifa
  const imageUrls = raffle.imageUrls || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <IconButton
          onClick={() => router.push(`/raffle/${resolvedParams.id}`)}
          icon={<ArrowLeft className="h-5 w-5" />}
          tooltip="Volver al tablero"
          tooltipSide="bottom"
          aria-label="Volver al tablero de la rifa"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold font-headline truncate">Detalles de la Rifa</h1>
          <p className="text-primario-oscuro/60 text-sm md:text-base mt-1">
            {truncateText(raffle.description, 150)}
          </p>
        </div>
      </div>

      {/* Hero Section - Nueva Distribución Innovadora */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Principal de Información */}
        <div className="lg:col-span-2">
          <motion.div
            whileHover={{ scale: 1.01, y: -1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-2xl h-auto lg:h-[240px]"
          >
            {/* Fondo con degradado sutil en hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-acento-fuerte/5 via-transparent to-acento-calido/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-2xl"></div>
            
            <CardHeader className="pb-4 relative z-10 bg-gradient-to-r from-acento-fuerte/90 via-acento-fuerte/80 to-acento-calido/90 p-6 text-white rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <Info className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">
                      {raffle.name}
                    </CardTitle>
                    <p className="text-white/90 text-sm mt-1">
                      {raffle.ownerName || 'Organizador'}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={`text-xs font-semibold ${
                    raffle.finalizedAt 
                      ? "bg-warning text-warning-foreground hover:bg-warning/90" 
                      : "bg-success text-success-foreground hover:bg-success/90"
                  }`}
                >
                  {raffle.finalizedAt ? "Finalizada" : "Activa"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="p-2 bg-acento-fuerte/20 rounded-lg"
                    >
                      <Grid3X3 className="h-5 w-5 text-acento-fuerte" />
                    </motion.div>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-acento-fuerte">100</div>
                  <div className="text-xs text-muted-foreground">Casillas</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="p-2 bg-acento-calido/20 rounded-lg"
                    >
                      <ShoppingCart className="h-5 w-5 text-acento-calido" />
                    </motion.div>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-acento-calido">{filledSlots}</div>
                  <div className="text-xs text-muted-foreground">Vendidas</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <motion.div
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="p-2 bg-primario-oscuro/20 rounded-lg"
                    >
                      <DollarSign className="h-5 w-5 text-primario-oscuro" />
                    </motion.div>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-primario-oscuro">{formatCurrencyCOP(raffle.slotPrice)}</div>
                  <div className="text-xs text-muted-foreground">Precio</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      className="p-2 bg-success/20 rounded-lg"
                    >
                      <TrendingUp className="h-5 w-5 text-success" />
                    </motion.div>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-success">{formatCurrencyCOP(potentialRevenue)}</div>
                  <div className="text-xs text-muted-foreground">Ingresos</div>
                </div>
              </div>
            </CardContent>
          </motion.div>
        </div>

        {/* Cards Verticales de Información Rápida - Diseño Optimizado y Responsivo */}
        <div className="lg:space-y-4 lg:flex lg:flex-col gap-4 grid grid-cols-2">
          {/* Card de Progreso - Diseño Optimizado */}
          <motion.div
            whileHover={{ scale: 1.02, y: -1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-2xl h-[120px] md:h-[130px] hover:shadow-xl transition-all duration-300"
          >
            {/* Fondo con degradado inspirado en StatCard */}
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-acento-calido/5 to-success/10 opacity-50"></div>
            
            {/* Efecto de brillo en hover como en los cards del dashboard */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            
            <CardContent className="p-4 h-full flex flex-col justify-center space-y-3 relative z-10">
              {/* Fila 1: Icono + Porcentaje + Barra de progreso (horizontal) */}
              <div className="flex items-center justify-between gap-3">
                {/* Icono animado */}
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="p-1.5 bg-success/20 rounded-lg flex-shrink-0"
                >
                  <TrendingUp className="h-4 w-4 text-success" />
                </motion.div>
                
                {/* Porcentaje */}
                <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-success to-acento-fuerte bg-clip-text text-transparent flex-shrink-0">
                  {filledSlots}%
                </div>
                
                {/* Barra de progreso horizontal */}
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden min-w-[60px]">
                  <motion.div 
                    className="bg-gradient-to-r from-success to-acento-fuerte h-1.5 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${filledSlots}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${filledSlots}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              
              {/* Fila 2: Texto descriptivo centrado */}
              <div className="text-center text-[10px] md:text-xs text-muted-foreground font-medium leading-tight">
                {filledSlots} de 100 casillas
              </div>
            </CardContent>
          </motion.div>

          {/* Card de Fecha Límite - Diseño Optimizado */}
          {raffle.finalizationDate && (
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-2xl h-[120px] md:h-[130px] hover:shadow-xl transition-all duration-300"
            >
              {/* Fondo con degradado inspirado en los cards del dashboard */}
              <div className="absolute inset-0 bg-gradient-to-br from-acento-calido/10 via-acento-calido/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-barra-principal/5 to-acento-calido/10 opacity-50"></div>
              
              {/* Efecto de brillo en hover consistente */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              
            <CardContent className="p-4 h-full flex flex-col justify-center space-y-3 relative z-10">
              {/* Fila 1: Icono + Fecha principal + Año (horizontal) */}
              <div className="flex items-center justify-between gap-3">
                {/* Icono animado */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="p-1.5 bg-acento-calido/20 rounded-lg flex-shrink-0"
                >
                  <Calendar className="h-4 w-4 text-acento-calido" />
                </motion.div>
                
                {/* Fecha principal con gradiente */}
                <div className="text-lg md:text-xl font-bold bg-gradient-to-r from-acento-calido to-barra-principal bg-clip-text text-transparent flex-shrink-0">
                  {format(new Date(raffle.finalizationDate), "dd MMM", { locale: es })}
                </div>
                
                {/* Año */}
                <div className="text-base md:text-lg font-semibold text-barra-principal flex-shrink-0">
                  {format(new Date(raffle.finalizationDate), "yyyy", { locale: es })}
                </div>
              </div>
              
              {/* Fila 2: Texto descriptivo centrado */}
              <div className="text-center text-[10px] md:text-xs text-muted-foreground font-medium leading-tight">
                Fecha límite
              </div>
            </CardContent>
            </motion.div>
          )}
        </div>
      </div>

      {/* Card de Ganador (si aplica) - Nueva Ubicación Destacada */}
      {raffle.finalizedAt && winnerName && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ scale: 1.01, y: -1 }}
          className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slot-winning/20 via-slot-winning/10 to-transparent opacity-50 rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-2xl"></div>
          
          <CardHeader className="pb-4 relative z-10 bg-gradient-to-r from-slot-winning/90 via-slot-winning/80 to-acento-fuerte/90 p-6 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
              >
                <Trophy className="h-6 w-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-white">
                  🎉 ¡Felicidades al Ganador!
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 relative z-10">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Casilla Ganadora</div>
                  <Badge variant="outline" className="border-slot-winning text-primario-oscuro font-mono text-lg px-4 py-2">
                    #{raffle.winnerSlotNumber}
                  </Badge>
                </div>
                <div className="text-4xl">👑</div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Ganador</div>
                  <div className="text-xl font-bold text-primario-oscuro">{winnerName}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </motion.div>
      )}

      {/* Galería de Fotos - Nuevo Feature */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="group relative bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-2xl"
      >
        <CardHeader className="pb-4 relative z-10 bg-gradient-to-r from-acento-fuerte/90 via-acento-fuerte/80 to-acento-calido/90 p-6 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <Image className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-white">
                Galería de Fotos
              </CardTitle>
            </div>
          </div>
        </CardHeader>
          <CardContent className="p-4 md:p-6 relative z-10">
            <RaffleImageCarousel imageUrls={imageUrls} raffleName={raffle.name} />
          </CardContent>
      </motion.div>

      {/* Términos y Condiciones - Diseño Optimizado */}
      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-barra-principal/10 via-barra-principal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-acento-calido/5 to-barra-principal/10 opacity-50 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-2xl"></div>
        
        <CardHeader className="pb-4 relative z-10 bg-gradient-to-r from-barra-principal/90 via-barra-principal/80 to-acento-calido/90 p-6 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <ScrollText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-white">
                Términos y Condiciones
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          <ScrollArea className="h-[200px] w-full rounded-md border border-border p-4">
            <p className="text-sm text-primario-oscuro/70 leading-relaxed whitespace-pre-wrap">
              {raffle.terms}
            </p>
          </ScrollArea>
        </CardContent>
      </motion.div>

      {/* Historial de Actividades (solo para propietarios) */}
      {isOwner && (
        <ActivityTimeline 
          activities={activities} 
          loading={activitiesLoading}
        />
      )}
    </div>
  );
}
