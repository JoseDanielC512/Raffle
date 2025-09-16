import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getRafflesForUser } from "@/lib/data";
import RaffleCard from "@/components/raffle/raffle-card";

export default async function Dashboard() {
  // In a real app, userId would come from the session.
  const raffles = await getRafflesForUser("1");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Your Raffles</h1>
        <Button asChild>
          <Link href="/raffle/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Raffle
          </Link>
        </Button>
      </div>
      
      {raffles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {raffles.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">No raffles yet!</h2>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first raffle.
          </p>
          <Button asChild>
            <Link href="/raffle/create">Create a Raffle</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
