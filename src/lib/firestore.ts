'use server';

import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
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
    const rafflesRef = collection(db, 'raffles');
    const q = query(rafflesRef, where('ownerId', '==', userId), where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
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
    console.log('No user ID provided, returning empty array.');
    return [];
  }

  try {
    const rafflesRef = collection(db, 'raffles');
    const q = query(rafflesRef, where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const rafflesWithSlots = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const raffleData = doc.data() as Omit<Raffle, 'id'>;
        const raffleId = doc.id;
        
        // Get slots for this raffle
        const slotsRef = collection(db, 'raffles', raffleId, 'slots');
        const slotsSnapshot = await getDocs(slotsRef);
        
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
