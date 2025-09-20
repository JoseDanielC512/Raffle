import { getAdminDb } from './firebase-admin';

/**
 * Counts the number of active raffles for a specific user using the Admin SDK.
 * @param userId The UID of the user.
 * @returns A promise that resolves to the count of active raffles.
 */
export async function countActiveRafflesForUserAdmin(userId: string): Promise<number> {
  if (!userId) {
    return 0;
  }
  try {
    const db = getAdminDb();
    const rafflesRef = db.collection('raffles');
    const q = rafflesRef.where('ownerId', '==', userId).where('status', '==', 'active');
    const querySnapshot = await q.get();
    return querySnapshot.size;
  } catch (error) {
    console.error("Error counting active raffles for user (admin):", error);
    // In a secure server environment, we should probably throw the error
    // or handle it more gracefully than returning 0.
    throw error;
  }
}
