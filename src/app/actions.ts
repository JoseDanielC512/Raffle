'use server';

import { z } from 'zod';
import { generateRaffleDetails } from '@/ai/flows/generate-raffle-details';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createRaffle, finalizeRaffle, updateSlot } from '@/lib/data';
import type { SlotStatus } from '@/lib/definitions';

// AI Generation Action
const GenerateDetailsSchema = z.object({
  prompt: z.string().min(10, { message: 'Por favor, proporciona un prompt más detallado.' }),
});

export type GenerateState = {
  message: string | null;
  name?: string;
  description?: string;
  terms?: string;
  errors?: {
    prompt?: string[];
  };
};

export async function generateDetailsAction(prevState: GenerateState, formData: FormData): Promise<GenerateState> {
  const validatedFields = GenerateDetailsSchema.safeParse({
    prompt: formData.get('prompt'),
  });

  if (!validatedFields.success) {
    return {
      message: 'La validación falló. Por favor, revisa tus entradas.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateRaffleDetails({ prompt: validatedFields.data.prompt });
    return { message: 'Detalles generados con éxito.', ...result };
  } catch (error) {
    return { message: 'Ocurrió un error durante la generación de la IA. Por favor, inténtalo de nuevo.' };
  }
}


// Raffle Creation Action
const CreateRaffleSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  description: z.string().min(1, 'La descripción es obligatoria.'),
  terms: z.string().min(1, 'Los términos son obligatorios.'),
});

export async function createRaffleAction(formData: FormData) {
  const validatedFields = CreateRaffleSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    terms: formData.get('terms'),
  });

  if (!validatedFields.success) {
    throw new Error('La validación falló');
  }

  // In a real app, ownerId would come from the authenticated user session.
  const ownerId = '1'; 
  
  try {
    const newRaffle = await createRaffle(validatedFields.data, ownerId);
    revalidatePath('/dashboard');
    redirect(`/raffle/${newRaffle.id}`);
  } catch (error) {
    throw new Error('Error al crear la rifa');
  }
}


// Update Slot Action
const UpdateSlotSchema = z.object({
  raffleId: z.string(),
  slotNumber: z.coerce.number(),
  participantName: z.string(),
  status: z.enum(['available', 'reserved', 'paid']),
});

export async function updateSlotAction(formData: FormData) {
  const validatedFields = UpdateSlotSchema.safeParse({
    raffleId: formData.get('raffleId'),
    slotNumber: formData.get('slotNumber'),
    participantName: formData.get('participantName'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    throw new Error('Datos de la casilla no válidos');
  }

  const { raffleId, slotNumber, ...data } = validatedFields.data;

  try {
    await updateSlot(raffleId, slotNumber, { participantName: data.participantName, status: data.status as SlotStatus });
    revalidatePath(`/raffle/${raffleId}`);
  } catch (error) {
    throw new Error('Error al actualizar la casilla');
  }
}

// Finalize Raffle Action
export async function finalizeRaffleAction(raffleId: string) {
    if (!raffleId) {
        throw new Error('Se requiere el ID de la rifa.');
    }

    try {
        await finalizeRaffle(raffleId);
        revalidatePath(`/raffle/${raffleId}`);
    } catch (error) {
        console.error('Error de finalización:', error);
        throw new Error('Error al finalizar la rifa.');
    }
}
