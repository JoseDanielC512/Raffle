'use server';

import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getAdminDb } from './firebase-admin';
import type { Raffle, RaffleSlot } from './definitions';

/**
 * Counts the number of active raffles for a specific user.
 * @param userId The UID of the user.
 * @returns A promise that resolves to the count of active raffles.
 */
export async function countActiveRafflesForUser(userId: string): Promise<number> {
  if (!userId) {
    return 0;
  }

  try {
    const adminDb = getAdminDb();
    const rafflesRef = adminDb.collection('raffles');
    const q = rafflesRef.where('ownerId', '==', userId).where('status', '==', 'active');
    const querySnapshot = await q.get();

    return querySnapshot.size;
  } catch (error) {
    console.error("Error counting active raffles for user: ", error);
    return 0; // In case of error, assume 0 to allow creation or show 0 on UI
  }
}

/**
 * Fetches all raffles owned by a specific user.
 * @param userId The UID of the user.
 * @returns A promise that resolves to an array of raffles with filledSlots count.
 */
export async function getRafflesForUser(userId: string): Promise<(Raffle & { filledSlots: number })[]> {
  if (!userId) {
    return [];
  }

  try {
    const adminDb = getAdminDb();
    const rafflesRef = adminDb.collection('raffles');
    const q = rafflesRef.where('ownerId', '==', userId);
    const querySnapshot = await q.get();

    if (querySnapshot.size === 0) {
      return [];
    }

    const rafflesWithSlots = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const raffleData = doc.data() as Omit<Raffle, 'id'>;
        const raffleId = doc.id;

        try {
          // Get slots for this raffle
          const slotsRef = adminDb.collection('raffles').doc(raffleId).collection('slots');
          const slotsSnapshot = await slotsRef.get();

          // Count filled slots (paid or reserved)
          const filledSlots = slotsSnapshot.docs.filter(slotDoc => {
            const slot = slotDoc.data();
            return slot.status === 'paid' || slot.status === 'reserved';
          }).length;

          return {
            id: raffleId,
            ...raffleData,
            filledSlots,
          };
        } catch (slotsError) {
          console.error(`Error fetching slots for raffle ${raffleId}:`, slotsError);
          // Return raffle with 0 filled slots if slots query fails
          return {
            id: raffleId,
            ...raffleData,
            filledSlots: 0,
          };
        }
      })
    );

    return rafflesWithSlots;
  } catch (error) {
    console.error("Error fetching user's raffles: ", error);
    return [];
  }
}

/**
 * Fetches a single raffle document by its ID.
 * @param raffleId The ID of the raffle document.
 * @returns A promise that resolves to the raffle object or null if not found.
 */
export async function getRaffleById(raffleId: string): Promise<Raffle | null> {
  if (!raffleId) return null;
  try {
    const raffleRef = doc(db, 'raffles', raffleId);
    const docSnap = await getDoc(raffleRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Raffle;
    }
    return null;
  } catch (error) {
    console.error("Error fetching raffle by ID: ", error);
    return null;
  }
}

/**
 * Fetches all slots for a specific raffle.
 * @param raffleId The ID of the raffle.
 * @returns A promise that resolves to an array of raffle slots.
 */
export async function getSlotsForRaffle(raffleId: string): Promise<RaffleSlot[]> {
  if (!raffleId) return [];
  try {
    const slotsRef = collection(db, 'raffles', raffleId, 'slots');
    const querySnapshot = await getDocs(slotsRef);
    
    const slots: RaffleSlot[] = querySnapshot.docs.map(doc => doc.data() as RaffleSlot);
    // Sort slots by slot number
    slots.sort((a, b) => a.slotNumber - b.slotNumber);

    return slots;
  } catch (error) {
    console.error("Error fetching slots for raffle: ", error);
    return [];
  }
}
