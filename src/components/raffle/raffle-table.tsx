'use client';

import type { Raffle } from "@/lib/definitions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

type RaffleTableProps = {
  raffles: (Raffle & { filledSlots?: number; winnerName?: string })[];
};

export function RaffleTable({ raffles }: RaffleTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre de la Rifa</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Casillas Vendidas</TableHead>
          <TableHead>
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {raffles.map((raffle) => (
          <TableRow key={raffle.id}>
            <TableCell className="font-medium">{raffle.name}</TableCell>
            <TableCell>
              <Badge variant={raffle.status === 'finalized' ? "destructive" : "secondary"}>
                {raffle.status === 'finalized' ? "Finalizada" : "Activa"}
              </Badge>
            </TableCell>
            <TableCell>{raffle.filledSlots} / 100</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/raffle/${raffle.id}`}>Ver Detalles</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                  <DropdownMenuItem>Finalizar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}