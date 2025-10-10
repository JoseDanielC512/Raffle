'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CreateRaffleForm } from "@/components/raffle/create-raffle-form";
import { IconButton } from "@/components/ui/icon-button";

export default function CreateRafflePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header con navegación de regreso */}
      <div className="flex items-center gap-3">
        <IconButton
          onClick={() => router.push('/dashboard')}
          icon={<ArrowLeft className="h-5 w-5" />}
          tooltip="Volver al Dashboard"
          tooltipSide="bottom"
          aria-label="Volver al dashboard"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold font-headline truncate">Crear una Nueva Rifa</h1>
          <p className="text-primario-oscuro/60 text-sm md:text-base mt-1">
            Describe tu premio y deja que nuestra IA te ayude con los detalles
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <CreateRaffleForm />
        </div>
      </div>
    </div>
  );
}
