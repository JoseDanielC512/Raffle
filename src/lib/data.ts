import type { Raffle, RaffleSlot, SlotStatus } from './definitions';

// In-memory store
let raffles: Raffle[] = [
  {
    id: '1',
    ownerId: '1',
    name: 'PS5 Console Giveaway',
    description: 'Win a brand new PlayStation 5! The ultimate gaming experience awaits. Enter now for your chance to own the most sought-after console.',
    terms: 'Winner must claim prize within 7 days. UK residents only. Must be 18 or older to enter.',
    createdAt: new Date().toISOString(),
    finalizedAt: null,
    winnerSlotNumber: null,
    slots: Array.from({ length: 100 }, (_, i) => ({
      slotNumber: i + 1,
      participantName: i < 20 ? `User ${i + 1}` : '',
      status: i < 15 ? 'paid' : i < 20 ? 'reserved' : 'available',
    })),
  },
];

const createInitialSlots = (): RaffleSlot[] => {
  return Array.from({ length: 100 }, (_, i) => ({
    slotNumber: i + 1,
    participantName: '',
    status: 'available',
  }));
};

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getRafflesForUser(userId: string): Promise<Raffle[]> {
  await delay(500);
  return raffles.filter(r => r.ownerId === userId);
}

export async function getRaffleById(raffleId: string): Promise<Raffle | undefined> {
  await delay(500);
  return raffles.find(r => r.id === raffleId);
}

export async function createRaffle(data: { name: string, description: string, terms: string }, ownerId: string): Promise<Raffle> {
  await delay(1000);
  const newRaffle: Raffle = {
    id: String(raffles.length + 1),
    ownerId,
    ...data,
    slots: createInitialSlots(),
    winnerSlotNumber: null,
    createdAt: new Date().toISOString(),
    finalizedAt: null,
  };
  raffles.push(newRaffle);
  return newRaffle;
}

export async function updateSlot(raffleId: string, slotNumber: number, data: { participantName: string, status: SlotStatus }): Promise<Raffle | undefined> {
  await delay(300);
  const raffle = raffles.find(r => r.id === raffleId);
  if (raffle) {
    const slotIndex = raffle.slots.findIndex(s => s.slotNumber === slotNumber);
    if (slotIndex !== -1) {
      raffle.slots[slotIndex] = { ...raffle.slots[slotIndex], ...data };
      return raffle;
    }
  }
  return undefined;
}

export async function finalizeRaffle(raffleId: string): Promise<Raffle | undefined> {
  await delay(1500);
  const raffle = raffles.find(r => r.id === raffleId);
  if (raffle && !raffle.finalizedAt) {
    // For simplicity, we pick a winner from all slots.
    // In a real app, you might only pick from 'paid' slots.
    const winnerSlotNumber = Math.floor(Math.random() * 100) + 1;
    raffle.winnerSlotNumber = winnerSlotNumber;
    raffle.finalizedAt = new Date().toISOString();
    return raffle;
  }
  return undefined;
}
