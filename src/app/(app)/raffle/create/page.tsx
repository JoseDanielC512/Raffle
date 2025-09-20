'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CreateRaffleForm } from "@/components/raffle/create-raffle-form";

export default function CreateRafflePage() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200 group"
          aria-label="Volver al dashboard"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
        </button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Crear una Nueva Rifa</h1>
          <p className="text-muted-foreground">
            Describe tu premio y deja que nuestra IA te ayude con los detalles.
          </p>
        </div>
      </div>
      <CreateRaffleForm />
    </div>
  );
}
