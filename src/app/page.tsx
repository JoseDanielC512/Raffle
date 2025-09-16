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
                    Crea Tu Rifa Perfecta en Minutos
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Rifa de la Suerte 100 simplifica el lanzamiento y la gestión de rifas de 100 casillas. Utiliza nuestro tablero interactivo y herramientas impulsadas por IA para comenzar.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Comienza Gratis</Link>
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
                  Características Clave
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Todo lo que Necesitas para una Rifa Exitosa
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Desde la creación hasta el sorteo del ganador, te tenemos cubierto con herramientas intuitivas y características potentes.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <Ticket className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-headline">Tablero Interactivo</h3>
                <p className="text-muted-foreground">
                  Gestiona fácilmente las 100 casillas en un tablero visual y codificado por colores. Actualiza nombres y estados con un solo clic.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <Bot className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-headline">Creación Impulsada por IA</h3>
                <p className="text-muted-foreground">
                  ¿Te cuesta encontrar las palabras? Deja que nuestra IA genere nombres de rifas, descripciones y términos atractivos para ti.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-headline">Selección Segura del Ganador</h3>
                <p className="text-muted-foreground">
                  Finaliza tu rifa y sortea un ganador al azar con una transacción segura de un solo clic.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
