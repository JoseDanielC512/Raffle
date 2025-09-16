import type { Raffle } from "@/lib/definitions";
import RaffleSlot from "./raffle-slot";
import { Card, CardContent } from "../ui/card";

type RaffleBoardProps = {
  raffle: Raffle;
};

export default function RaffleBoard({ raffle }: RaffleBoardProps) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-10 gap-2">
          {raffle.slots.map((slot) => (
            <RaffleSlot key={slot.slotNumber} slot={slot} raffleId={raffle.id} isWinner={raffle.winnerSlotNumber === slot.slotNumber} isFinalized={!!raffle.finalizedAt} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
