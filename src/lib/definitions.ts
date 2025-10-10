export type SlotStatus = 'available' | 'reserved' | 'paid';

export type RaffleSlot = {
  slotNumber: number;
  participantName: string;
  status: SlotStatus;
};

export type Raffle = {
  id: string; // Document ID
  ownerId: string; // UID from Firebase Auth
  ownerName?: string; // Display name of the owner
  name: string;
  description: string;
  terms: string;
  status: 'active' | 'finalized';
  winnerSlotNumber: number | null;
  createdAt: string;
  finalizedAt: string | null;
  finalizationDate: string | null; // Fecha de finalización programada
  slotPrice: number; // Precio de la casilla, obligatorio
  activityHistory?: RaffleActivity[]; // Array of activity logs
  imageUrls?: string[]; // URLs de las imágenes de la rifa
};

export type RaffleActivity = {
  id: string;
  action: 'slot_updated' | 'raffle_created' | 'raffle_finalized' | 'raffle_updated';
  timestamp: string;
  userId: string;
  details: {
    slotNumber?: number;
    previousStatus?: SlotStatus;
    newStatus?: SlotStatus;
    winnerSlotNumber?: number;
    message?: string;
  };
};
