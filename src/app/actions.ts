'use server';

import { z } from 'zod';
import { generateRaffleDetails } from '@/ai/flows/generate-raffle-details';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createRaffle, finalizeRaffle, updateSlot } from '@/lib/data';
import type { SlotStatus } from '@/lib/definitions';

// AI Generation Action
const GenerateDetailsSchema = z.object({
  prompt: z.string().min(10, { message: 'Please provide a more detailed prompt.' }),
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
      message: 'Validation failed. Please check your input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateRaffleDetails({ prompt: validatedFields.data.prompt });
    return { message: 'Details generated successfully.', ...result };
  } catch (error) {
    return { message: 'An error occurred during AI generation. Please try again.' };
  }
}


// Raffle Creation Action
const CreateRaffleSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().min(1, 'Description is required.'),
  terms: z.string().min(1, 'Terms are required.'),
});

export async function createRaffleAction(formData: FormData) {
  const validatedFields = CreateRaffleSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    terms: formData.get('terms'),
  });

  if (!validatedFields.success) {
    throw new Error('Validation failed');
  }

  // In a real app, ownerId would come from the authenticated user session.
  const ownerId = '1'; 
  
  try {
    const newRaffle = await createRaffle(validatedFields.data, ownerId);
    revalidatePath('/dashboard');
    redirect(`/raffle/${newRaffle.id}`);
  } catch (error) {
    throw new Error('Failed to create raffle');
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
    throw new Error('Invalid slot data');
  }

  const { raffleId, slotNumber, ...data } = validatedFields.data;

  try {
    await updateSlot(raffleId, slotNumber, { participantName: data.participantName, status: data.status as SlotStatus });
    revalidatePath(`/raffle/${raffleId}`);
  } catch (error) {
    throw new Error('Failed to update slot');
  }
}

// Finalize Raffle Action
export async function finalizeRaffleAction(raffleId: string) {
    if (!raffleId) {
        throw new Error('Raffle ID is required.');
    }

    try {
        await finalizeRaffle(raffleId);
        revalidatePath(`/raffle/${raffleId}`);
    } catch (error) {
        console.error('Finalization Error:', error);
        throw new Error('Failed to finalize the raffle.');
    }
}
