export type SlotStatus = 'available' | 'reserved' | 'paid';

export type RaffleSlot = {
  slotNumber: number;
  participantName: string;
  status: SlotStatus;
};

export type Raffle = {
  id: string; // Document ID
  ownerId: string; // UID from Firebase Auth
  name: string;
  description: string;
  terms: string;
  status: 'active' | 'finalized';
  winnerSlotNumber: number | null;
  createdAt: string;
  finalizedAt: string | null;
};
