'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Ticket, PlusCircle } from 'lucide-react';

export function SidebarContent({ activeRafflesCount = 0 }: { activeRafflesCount?: number }) {
  const canCreateRaffle = activeRafflesCount < 2;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">Rifas Seguras</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/dashboard" className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent">
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <Link href="/dashboard" className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent">
          <Ticket className="h-4 w-4" />
          <span>Mis Rifas</span>
        </Link>
        {canCreateRaffle ? (
          <Button asChild variant="ghost" className="w-full justify-start space-x-2">
            <Link href="/raffle/create">
              <PlusCircle className="h-4 w-4" />
              <span>Crear Nueva</span>
            </Link>
          </Button>
        ) : (
          <Button disabled className="w-full justify-start space-x-2 cursor-not-allowed opacity-50">
            <PlusCircle className="h-4 w-4" />
            <span>Límite Alcanzado</span>
          </Button>
        )}
      </nav>
    </div>
  );
}

export function Sidebar({ activeRafflesCount = 0 }: { activeRafflesCount?: number }) {
  return (
    <div className="hidden md:block w-64 bg-background border-r h-screen sticky top-0 p-0">
      <SidebarContent activeRafflesCount={activeRafflesCount} />
    </div>
  );
}
