'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Ticket, Star, Bot } from "lucide-react";

export default function Home() {
  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-gray-900">
                  Rifas Seguras
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Plataforma simple y segura para organizar y participar en rifas transparentes.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/register">Comenzar como Organizador</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
               <Ticket className="h-48 w-48 text-blue-200" strokeWidth={0.5} />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
        <div className="container px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            {/* Teaser Dashboard */}
            <div className="group cursor-pointer rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-xl font-bold font-headline mb-4 text-gray-900">Dashboard del Organizador</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rifas Activas:</span>
                  <span className="font-semibold text-blue-600">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Casillas Vendidas:</span>
                  <span className="font-semibold text-green-600">75 / 200</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Panel de control con métricas clave y listado de rifas.</p>
              <Button variant="outline" size="sm" className="w-full">Ver Dashboard</Button>
            </div>

            {/* Teaser Tablero */}
            <div className="group cursor-pointer rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-xl font-bold font-headline mb-4 text-gray-900">Tablero de Rifas</h3>
              <div className="grid grid-cols-5 gap-1 mb-4" style={{maxHeight: '120px', overflow: 'hidden'}}>
                {/* Preview grid 5x5 sample */}
                {Array.from({length: 25}).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-sm border ${
                      i % 5 === 0 ? 'bg-green-500' :
                      i % 3 === 0 ? 'bg-yellow-500' :
                      i % 7 === 0 ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4">Visualiza 100 casillas con colores intuitivos para estados.</p>
              <Button variant="outline" size="sm" className="w-full">Explorar Tablero</Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 border-t bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">&copy; 2025 Rifas Seguras. Todos los derechos reservados.</p>
            <div className="flex space-x-4">
              <Link href="/login" className="text-sm text-primary hover:underline">Iniciar Sesión</Link>
              <Link href="/register" className="text-sm text-primary hover:underline">Registrarse</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
