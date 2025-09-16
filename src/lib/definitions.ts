export type SlotStatus = 'available' | 'reserved' | 'paid';

export type RaffleSlot = {
  slotNumber: number;
  participantName: string;
  status: SlotStatus;
};

export type Raffle = {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  terms: string;
  slots: RaffleSlot[];
  winnerSlotNumber: number | null;
  createdAt: string;
  finalizedAt: string | null;
};
