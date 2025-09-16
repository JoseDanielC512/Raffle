import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Link from "next/link";
import { Ticket, Star, Bot } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Create Your Perfect Raffle in Minutes
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Lucky 100 Raffle makes it simple to launch and manage
                    100-slot raffles. Use our interactive board and AI-powered
                    tools to get started.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Get Started for Free</Link>
                  </Button>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                 <Ticket className="h-48 w-48 text-primary/10" strokeWidth={0.5} />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Everything You Need for a Successful Raffle
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From creation to drawing the winner, we've got you covered
                  with intuitive tools and powerful features.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <Ticket className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-headline">Interactive Board</h3>
                <p className="text-muted-foreground">
                  Easily manage all 100 slots on a visual, color-coded board.
                  Update names and statuses with a single click.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <Bot className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-headline">AI-Powered Creation</h3>
                <p className="text-muted-foreground">
                  Struggling with words? Let our AI generate compelling raffle
                  names, descriptions, and terms for you.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-headline">Secure Winner Selection</h3>
                <p className="text-muted-foreground">
                  Finalize your raffle and draw a random winner with a secure,
                  one-click transaction.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
