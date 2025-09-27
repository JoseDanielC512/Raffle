'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CreateRaffleForm } from "@/components/raffle/create-raffle-form";
import { IconButton } from "@/components/ui/icon-button";

export default function CreateRafflePage() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {/* Back Button */}
        <IconButton
          onClick={() => router.push('/dashboard')}
          icon={<ArrowLeft className="h-5 w-5" />}
          tooltip="Volver al Dashboard"
          tooltipSide="bottom"
          aria-label="Volver al dashboard"
        />
        <div>
          <h1 className="text-3xl font-bold font-headline">Crear una Nueva Rifa</h1>
          <p className="text-battleship_gray-600 dark:text-battleship_gray-400">
            Describe tu premio y deja que nuestra IA te ayude con los detalles.
          </p>
        </div>
      </div>
      <CreateRaffleForm />
    </div>
  );
}
