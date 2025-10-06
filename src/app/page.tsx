'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/layout/header";
import RaffleCard from "@/components/raffle/raffle-card";
import RaffleBoard from "@/components/raffle/raffle-board";
import { Raffle } from "@/lib/definitions";
import { RaffleSlot as RaffleSlotType } from "@/lib/definitions";
import { ArrowUpRight, Shield, Clock, Users } from "lucide-react";

const mockRaffles: Raffle[] = [
  {
    id: '1',
    name: '🏖️ Rifa de Viaje a la Playa',
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
    id: '2',
    name: '🏠 Rifa de Electródomesticos',
    description: '¡Gana electrodomésticos premium! Equipa tu hogar con los mejores productos.',
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

const mockSlots: RaffleSlotType[] = (() => {
  const slots: RaffleSlotType[] = [];
  const names = [
    'Carlos M.', 'María L.', 'Juan P.', 'Ana R.', 'Luis S.', 'Sofía H.', 
    'Diego M.', 'Valentina T.', 'Roberto G.', 'Camila V.', 'Pedro Á.',
    'Laura F.', 'Miguel S.', 'Isabella R.', 'Andrés M.', 'Daniela P.',
    'Fernando L.', 'Gabriela T.', 'Ricardo D.', 'Natalia S.', 'Javier C.',
    'Mónica G.', 'Sergio R.', 'Patricia M.', 'Alberto V.', 'Claudia H.',
    'Martín S.', 'Teresa L.', 'Oscar M.', 'Lucía P.', 'Ramiro G.',
    'Silvia T.', 'Eduardo R.', 'Adriana M.', 'Roberto D.', 'Karla S.',
    'Jorge H.', 'Elena M.', 'Pablo R.', 'Carmen V.', 'Antonio L.'
  ];
  
  for (let i = 0; i < 50; i++) {
    if (i === 42) {
      // Slot ganador
      slots.push({
        slotNumber: i,
        status: 'paid',
        participantName: 'Ana García',
      });
    } else {
      // Distribución aleatoria
      const random = Math.random();
      let status: 'available' | 'reserved' | 'paid';
      let participantName = '';
      
      if (random < 0.3) {
        // 30% disponibles
        status = 'available';
        participantName = '';
      } else if (random < 0.5) {
        // 20% reservados
        status = 'reserved';
        participantName = `${names[i % names.length]} (reservado)`;
      } else {
        // 50% pagados
        status = 'paid';
        participantName = names[i % names.length];
      }
      
      slots.push({
        slotNumber: i,
        status,
        participantName,
      });
    }
  }
  
  return slots;
})();

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
      <Header />
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

      {/* Rifas Destacadas y Tablero Combinados */}
      <motion.section 
        className="w-full py-16 bg-muted/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      >
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Rifas Activas y Tablero Interactivo</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Participa en rifas emocionantes, crea las tuyas y explora nuestro sistema de gestión en tiempo real.
            </p>
          </div>
          
          {/* Layout de dos columnas para desktop, una columna para mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Columna izquierda: Rifas Destacadas */}
            <motion.div 
              className="space-y-6"
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
              <div className="text-center lg:text-left mb-6">
                <h3 className="text-2xl font-semibold text-foreground mb-2">Participa y Crea</h3>
                <p className="text-muted-foreground">
                  Explora rifas disponibles o lanza la tuya.
                </p>
              </div>
              <div className="space-y-6">
                {mockRaffles.map((raffle) => (
                  <RaffleCard 
                    key={raffle.id} 
                    raffle={{
                      ...raffle,
                      // Añadir progresos realistas
                      ...(raffle.id === '1' && { filledSlots: 67 }), // 67% para rifa de viaje
                      ...(raffle.id === '2' && { filledSlots: 100 }), // 100% para rifa finalizada
                      // Añadir un nombre de ganador ficticio solo a la última raffle
                      ...(raffle.id === '2' && { winnerName: 'Ana García' })
                    }} 
                  />
                ))}
              </div>
            </motion.div>

            {/* Columna derecha: Tablero Demo */}
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <div className="text-center lg:text-left mb-6">
                <h3 className="text-2xl font-semibold text-foreground mb-2">Tablero en Vivo</h3>
                <p className="text-muted-foreground">
                  Sistema interactivo con colores intuitivos.
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.6, rotateY: 45, rotateX: 15, y: 50 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, y: 0 }}
                  transition={{ 
                    duration: 1.2, 
                    delay: 0.4,
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 80,
                    damping: 15
                  }}
                  className="w-full"
                  style={{ 
                    perspective: "1000px",
                    transformStyle: "preserve-3d"
                  }}
                >
                  <RaffleBoard
                    raffle={{
                      id: 'preview',
                      name: '🏠 Rifa de Electródomesticos',
                      description: '¡Gana electrodomésticos premium! Equipa tu hogar con los mejores productos.',
                      terms: 'Términos y condiciones de la rifa de electrónicos.',
                      status: 'finalized',
                      createdAt: new Date().toISOString(),
                      finalizedAt: new Date().toISOString(),
                      finalizationDate: null,
                      winnerSlotNumber: 42,
                      slotPrice: 15000,
                      ownerId: 'preview',
                    }}
                    slots={mockSlots}
                    isOwner={false}
                    onSlotUpdate={() => {}}
                  />
                </motion.div>
              </div>
            </motion.div>
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
              <Card className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl bg-card/80 backdrop-blur-sm border-border/60 shadow-lg rounded-2xl">
                {/* Fondo con degradado */}
                <div className="absolute inset-0 bg-gradient-to-br from-acento-fuerte/10 via-acento-fuerte/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-acento-calido/5 to-acento-fuerte/10 opacity-50"></div>
                
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-acento-fuerte to-acento-calido rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-acento-fuerte/30 flex-shrink-0">
                      <Shield className="h-6 w-6 text-white drop-shadow-md" />
                    </div>
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-acento-fuerte to-primario-oscuro bg-clip-text text-transparent group-hover:from-acento-calido group-hover:to-acento-fuerte transition-all duration-500">
                      Rifas Seguras y Transparentes
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-foreground/80 leading-relaxed">
                    Nuestra plataforma está protegida con Firebase y reglas de seguridad robustas para garantizar transacciones seguras y transparentes.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 }}}>
              <Card className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl bg-card/80 backdrop-blur-sm border-border/60 shadow-lg rounded-2xl">
                {/* Fondo con degradado */}
                <div className="absolute inset-0 bg-gradient-to-br from-acento-calido/10 via-acento-calido/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-barra-principal/5 to-acento-calido/10 opacity-50"></div>
                
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-acento-calido to-barra-principal rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-lg shadow-acento-calido/30 flex-shrink-0">
                      <Clock className="h-6 w-6 text-white drop-shadow-md" />
                    </div>
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-acento-calido to-barra-principal bg-clip-text text-transparent group-hover:from-barra-principal group-hover:to-acento-calido transition-all duration-500">
                      Actualizaciones en Tiempo Real
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-foreground/80 leading-relaxed">
                    Gracias a los listeners de Firestore, el estado de las casillas se actualiza instantáneamente para todos los participantes.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 }}}>
              <Card className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl bg-card/80 backdrop-blur-sm border-border/60 shadow-lg rounded-2xl">
                {/* Fondo con degradado */}
                <div className="absolute inset-0 bg-gradient-to-br from-primario-oscuro/10 via-primario-oscuro/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-fondo-base/5 to-primario-oscuro/10 opacity-50"></div>
                
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primario-oscuro to-barra-principal rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-primario-oscuro/30 flex-shrink-0">
                      <Users className="h-6 w-6 text-white drop-shadow-md" />
                    </div>
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-primario-oscuro to-barra-principal bg-clip-text text-transparent group-hover:from-barra-principal group-hover:to-primario-oscuro transition-all duration-500">
                      Gestión Inteligente para Organizadores
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-foreground/80 leading-relaxed">
                    Establecemos un límite de 2 rifas activas por organizador y ofrecemos notificaciones y validaciones para una gestión sin complicaciones.
                  </CardDescription>
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
