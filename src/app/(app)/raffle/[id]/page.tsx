import { getRaffleById } from "@/lib/data";
import { notFound } from "next/navigation";
import RaffleBoard from "@/components/raffle/raffle-board";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RaffleFinalization from "@/components/raffle/raffle-finalization";

export default async function RafflePage({
  params,
}: {
  params: { id: string };
}) {
  const raffle = await getRaffleById(params.id);

  if (!raffle) {
    notFound();
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2">
        <RaffleBoard raffle={raffle} />
      </div>
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              {raffle.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">{raffle.description}</p>
            </div>
            <div>
                <h3 className="font-semibold mb-1">Terms & Conditions</h3>
                <p className="text-sm text-muted-foreground">{raffle.terms}</p>
            </div>
          </CardContent>
        </Card>

        <RaffleFinalization raffle={raffle} />
      </div>
    </div>
  );
}
