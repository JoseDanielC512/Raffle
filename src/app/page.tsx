'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import RaffleCard from "@/components/raffle/raffle-card";
import RaffleBoard from "@/components/raffle/raffle-board";
import { Raffle } from "@/lib/definitions";
import { RaffleSlot as RaffleSlotType } from "@/lib/definitions";
import { ArrowUpRight, Shield, Clock, Users } from "lucide-react";

const mockRaffles: Raffle[] = [
  {
    id: '1',
    name: 'Rifa de Bienes del Hogar',
    description: 'Organiza tu rifa para electrodomésticos nuevos. 100 casillas disponibles.',
    terms: 'Términos y condiciones de la rifa de bienes del hogar.',
    status: 'active',
    createdAt: new Date().toISOString(),
    finalizedAt: null,
    finalizationDate: null,
    winnerSlotNumber: null,
    slotPrice: 5000,
    ownerId: 'mock-owner',
  },
  {
    id: '2',
    name: 'Rifa de Viaje a la Playa',
    description: '¡Gana un viaje soñado! Casillas con progresión rápida.',
    terms: 'Términos y condiciones de la rifa de viaje.',
    status: 'active',
    createdAt: new Date().toISOString(),
    finalizedAt: null,
    finalizationDate: null,
    winnerSlotNumber: null,
    slotPrice: 10000,
    ownerId: 'mock-owner2',
  },
  {
    id: '3',
    name: 'Rifa de Electrónicos',
    description: 'Rifa finalizada - ¡Felicidades al ganador!',
    terms: 'Términos y condiciones de la rifa de electrónicos.',
    status: 'finalized',
    createdAt: new Date().toISOString(),
    finalizedAt: new Date().toISOString(),
    finalizationDate: null,
    winnerSlotNumber: 42,
    slotPrice: 15000,
    ownerId: 'mock-owner3',
  },
];

const mockSlots: RaffleSlotType[] = Array.from({ length: 10 }, (_, i) => ({
  slotNumber: i + 1,
  status: i % 4 === 0 ? 'paid' : i % 4 === 1 ? 'reserved' : 'available',
  participantName: i % 4 === 0 ? 'Usuario Ejemplo' : '',
}));

// Componente lógico: maneja redirect si está autenticado
export default function Home() {
  const { authStatus, loading } = useAuth();
  
  // Show a loading screen only while auth state is being determined.
  // The AuthNavigationHandler will redirect authenticated users away from this page.
  if (loading || authStatus === 'checking') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, they should be redirected by AuthNavigationHandler
  // This is a fallback safety check
  if (authStatus === 'authenticated') {
    return null; // Don't render anything while redirect happens
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <motion.section 
        className="relative w-full overflow-hidden bg-gradient-to-br from-acento-fuerte via-acento-calido to-barra-principal py-16 md:py-24 lg:py-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-[url('/api/placeholder/1200/800')] bg-cover bg-center opacity-5 animate-pulse"></div>
        <div className="relative container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white leading-tight [text-shadow:_0_2px_4px_rgba(0,0,0,0.3)]">
                Crea, Gestiona y Participa<br className="hidden md:block" /> en Rifas Modernas y Seguras
              </h1>
              <p className="mx-auto max-w-[800px] text-lg md:text-xl text-muted-foreground leading-relaxed">
                Una plataforma transparente y segura construida con Firebase para organizar rifas comunitarias, con actualizaciones en tiempo real y un sistema de 100 casillas fácil de usar.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto group bg-acento-fuerte text-white hover:bg-acento-fuerte/90 shadow-[0_0_15px_rgba(164,36,59,0.6)] hover:shadow-[0_0_25px_rgba(164,36,59,0.8)] transition-all duration-300">
                  <Link href="/dashboard">
                    <span className="flex items-center">
                      <ArrowUpRight className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      Ir al Dashboard
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Featured Rifas */}
      <motion.section 
        className="w-full py-16 bg-muted/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      >
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Rifas Destacadas</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explora algunas de las rifas activas en nuestra plataforma. ¡Anímate a crear la tuya y únete a la comunidad!
            </p>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
            {mockRaffles.map((raffle) => (
              <RaffleCard 
                key={raffle.id} 
                raffle={{
                  ...raffle,
                  // Añadir un nombre de ganador ficticio solo a la última raffle
                  ...(raffle.id === '3' && { winnerName: 'Ana García' })
                }} 
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Mini Board Preview */}
      <motion.section 
        className="w-full py-16 bg-background"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Así Funciona Nuestro Tablero</h2>
            <p className="text-muted-foreground">
              Gestiona fácilmente las 100 casillas con un sistema de colores intuitivo que te mantiene informado en tiempo real.
            </p>
          </div>
          <div className="max-w-lg mx-auto">
            <Card className="shadow-soft border-border">
              <CardContent className="p-4 md:p-6">
                <RaffleBoard
              raffle={{
                id: 'preview',
                name: 'Rifa de Ejemplo',
                description: 'Vista previa del tablero - 10 casillas de ejemplo',
                terms: 'Términos de la raffle de ejemplo.',
                status: 'active',
                createdAt: new Date().toISOString(),
                finalizedAt: null,
                finalizationDate: null,
                winnerSlotNumber: null,
                slotPrice: 7500,
                ownerId: 'preview',
              }}
              slots={mockSlots}
              isOwner={false}
              onSlotUpdate={() => {}}
              />
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section 
        className="w-full py-16 bg-muted/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      >
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">¿Por Qué Elegir Lucky 100 Raffle?</h2>
            <p className="text-muted-foreground">
              Te ofrecemos las mejores herramientas para una experiencia de rifas impecable.
            </p>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
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
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <Card className="group hover:shadow-lg transition-all duration-300 shadow-soft">
                <CardHeader>
                  <div className="w-12 h-12 bg-acento-fuerte/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-acento-fuerte/30 transition-colors">
                    <Shield className="h-6 w-6 text-acento-fuerte" />
                  </div>
                  <CardTitle className="text-lg">Rifas Seguras y Transparentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Nuestra plataforma está protegida con Firebase y reglas de seguridad robustas para garantizar transacciones seguras y transparentes.</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 }}}>
              <Card className="group hover:shadow-lg transition-all duration-300 shadow-soft">
                <CardHeader>
                  <div className="w-12 h-12 bg-acento-calido/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-acento-calido/30 transition-colors">
                    <Clock className="h-6 w-6 text-acento-calido" />
                  </div>
                  <CardTitle className="text-lg">Actualizaciones en Tiempo Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Gracias a los listeners de Firestore, el estado de las casillas se actualiza instantáneamente para todos los participantes.</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 }}}>
              <Card className="group hover:shadow-lg transition-all duration-300 shadow-soft">
                <CardHeader>
                  <div className="w-12 h-12 bg-primario-oscuro/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primario-oscuro/20 transition-colors">
                    <Users className="h-6 w-6 text-primario-oscuro" />
                  </div>
                  <CardTitle className="text-lg">Gestión Inteligente para Organizadores</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Establecemos un límite de 2 rifas activas por organizador y ofrecemos notificaciones y validaciones para una gestión sin complicaciones.</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.footer 
        className="w-full py-6 border-t bg-barra-principal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      >
        <div className="container px-4 md:px-6 mx-auto">
          <p className="text-center text-sm text-primario-oscuro">&copy; Made with &#10084; by José Castellanos</p>
        </div>
      </motion.footer>
    </div>
  );
}
