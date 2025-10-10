'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from "framer-motion";
import { db } from '@/lib/firebase';
import type { Raffle, RaffleSlot } from '@/lib/definitions';
import RaffleBoard from '@/components/raffle/raffle-board';
import RaffleInfoDialog from '@/components/raffle/RaffleInfoDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown } from "lucide-react";

// Skeleton component for initial loading
function PublicRaffleSkeleton() {
  return (
    <div className="min-h-screen relative overflow-y-auto bg-gradient-raffle p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-48 w-full rounded-2xl bg-acento-fuerte/10" />
        <Skeleton className="h-96 w-full rounded-2xl mt-8 bg-acento-fuerte/10" />
      </div>
    </div>
  );
}

export default function PublicRafflePage() {
  const params = useParams<{ raffleId: string }>();
  const { raffleId } = params;
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [slots, setSlots] = useState<RaffleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);


  useEffect(() => {
    if (!raffleId) return;
    const raffleRef = doc(db, 'raffles', raffleId);
    const raffleUnsubscribe = onSnapshot(raffleRef, (docSnap) => {
      if (docSnap.exists()) {
        setRaffle({ id: docSnap.id, ...docSnap.data() } as Raffle);
      } else {
        setError('Esta rifa no existe o ha sido eliminada.');
        setRaffle(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching raffle:", err);
      setError('No se pudo cargar la rifa.');
      setLoading(false);
    });

    const slotsQuery = query(collection(db, 'raffles', raffleId, 'slots'), orderBy('slotNumber', 'asc'));
    const slotsUnsubscribe = onSnapshot(slotsQuery, (querySnapshot) => {
      const slotsData = querySnapshot.docs.map(doc => ({ ...doc.data() } as RaffleSlot));
      setSlots(slotsData);
    });

    return () => {
      raffleUnsubscribe();
      slotsUnsubscribe();
    };
  }, [raffleId]);

  if (loading) {
    return <PublicRaffleSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 text-white">
        <div className="text-center p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
          <h2 className="text-3xl font-bold mb-4">Error</h2>
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!raffle) {
    return null; // Should be handled by error state
  }

  const isFinalized = raffle.status === 'finalized';
  const winnerSlot = isFinalized ? slots.find(s => s.slotNumber === raffle.winnerSlotNumber) : undefined;

  return (
    <div className="min-h-screen relative overflow-y-auto bg-gradient-raffle text-primario-oscuro">
      {/* Animated CSS Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/10 to-black/40 animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIgZD0iTTM2IDM0djJoLTJ2LTJoMnYyem0wLTR2MmgtMnYtMmgydjJ6bTAtNHYyaC0ydi0yaDJ2MnpNNDggNDh2LTJoLTJ2LTJoMnYyem0wLTR2MmgtMnYtMmgydjJ6bTAtNHYyaC0ydi0yaDJ2MnpNMTIgMTJ2LTJoLTJ2LTJoMnYyem0wLTR2MmgtMnYtMmgydjJ6bTAtNHYyaC0ydi0yaDJ2MnpNMjQgMjR2LTJoLTJ2LTJoMnYyem0wLTR2MmgtMnYtMmgydjJ6bTAtNHYyaC0ydi0yaDJ2MnoiLz48L2c+PC9zdmc+')] opacity-20"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 md:px-8 lg:px-12 max-w-7xl space-y-12">
        {/* Header Épico */}
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pb-8 border-b border-primario-oscuro/20"
          >
            <div className="flex items-center gap-6 flex-wrap">
              {/* Animated Icon */}
              <motion.div 
                className="w-20 h-20 bg-gradient-icon rounded-2xl flex items-center justify-center shadow-2xl shadow-acento-fuerte/50"
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
              
              <div className="space-y-2">
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

            {isFinalized && winnerSlot && (
              <motion.div 
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/50 rounded-2xl backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
              >
                <Crown className="h-8 w-8 text-amber-300 animate-pulse" />
                <div>
                  <p className="text-amber-100 font-semibold">Ganador:</p>
                  <p className="text-amber-50 text-xl font-bold">{winnerSlot.participantName}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="space-y-12">
          {/* Tablero Full-Width */}
          <AnimatePresence>
            <motion.section 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="w-full"
            >
              <RaffleBoard 
                raffle={raffle} 
                slots={slots} 
                isOwner={false} 
              />
            </motion.section>
          </AnimatePresence>

          {/* Diálogo de Información de la Rifa */}
          <RaffleInfoDialog
            open={isInfoDialogOpen}
            onOpenChange={setIsInfoDialogOpen}
            terms={raffle.terms}
            slotPrice={raffle.slotPrice}
            ownerName={raffle.ownerName}
            winnerName={winnerSlot?.participantName}
            winnerSlotNumber={raffle.winnerSlotNumber ?? undefined}
            isFinalized={isFinalized}
          />
        </div>
      </div>
    </div>
  );
}
