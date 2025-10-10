'use client';

import React, { useState } from "react";
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
import { MoreHorizontal, Eye, Edit, Flag, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import EditRaffleDialog from "@/components/raffle/EditRaffleDialog";
import DeclareWinnerDialog from "@/components/raffle/DeclareWinnerDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { formatCurrencyCOP } from "@/lib/utils";

type RaffleTableProps = {
  raffles: (Raffle & { filledSlots?: number; winnerName?: string })[];
};

function FinalizeRaffleMenuItem({ raffle }: { raffle: Raffle }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Verificar si es la fecha de finalización
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isFinalizationDate =
    raffle.finalizationDate &&
    new Date(raffle.finalizationDate).toDateString() === today.toDateString();

  const isOwner = user?.uid === raffle.ownerId;
  const canFinalize = isOwner && raffle.status === 'active' && isFinalizationDate;

  const handleConfirmFinalize = () => {
    setShowConfirmDialog(false);
    setShowWinnerDialog(true);
  };

  const handleFinalizationSuccess = () => {
    toast({
      title: '¡Rifa Finalizada!',
      description: 'La rifa ha sido finalizada exitosamente.',
      variant: 'success',
    });
  };

  if (!canFinalize) {
    return (
      <DropdownMenuItem 
        onClick={() => {
          if (!isFinalizationDate) {
            toast({
              title: 'Fecha no válida',
              description: 'Solo puedes finalizar la rifa en la fecha de finalización programada.',
              variant: 'destructive',
            });
          } else if (!isOwner) {
            toast({
              title: 'Permiso denegado',
              description: 'Solo el propietario puede finalizar la rifa.',
              variant: 'destructive',
            });
          }
        }}
      >
        <Flag className="mr-2 h-4 w-4" />
        Finalizar
      </DropdownMenuItem>
    );
  }

  return (
    <>
      <DropdownMenuItem onSelect={(e) => {
        e.preventDefault();
        setShowConfirmDialog(true);
      }}>
        <Flag className="mr-2 h-4 w-4" />
        Finalizar
      </DropdownMenuItem>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-xs min-h-[40vh] p-4 sm:p-6 sm:max-w-[425px] rounded-lg bg-background border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-primario-oscuro">
              <AlertTriangle className="h-5 w-5" />
              ¿Estás absolutamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción es irreversible. Una vez que declares el ganador, la rifa se
              finalizará permanentemente y no podrás realizar más cambios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-y-2 sm:space-y-0">
            <AlertDialogCancel className="w-full sm:w-auto mt-4 sm:mt-0">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmFinalize}
              className="w-full sm:w-auto"
            >
              Sí, finalizar rifa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeclareWinnerDialog
        raffleId={raffle.id}
        open={showWinnerDialog}
        onOpenChange={setShowWinnerDialog}
        onSuccess={handleFinalizationSuccess}
      />
    </>
  );
}

export function RaffleTable({ raffles }: RaffleTableProps) {
  const { user } = useAuth();

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Nombre de la Rifa</TableHead>
            <TableHead className="font-semibold">Precio</TableHead>
            <TableHead className="font-semibold">Estado</TableHead>
            <TableHead className="font-semibold">Casillas Vendidas</TableHead>
            <TableHead className="font-semibold">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {raffles.map((raffle) => {
            const isOwner = user?.uid === raffle.ownerId;
            const canEdit = isOwner && raffle.status === 'active';
            
            return (
              <TableRow key={raffle.id}>
                <TableCell className="font-medium">{raffle.name}</TableCell>
                <TableCell className="font-medium">{formatCurrencyCOP(raffle.slotPrice)}</TableCell>
                <TableCell>
                  <Badge variant={raffle.status === 'finalized' ? "destructive" : "secondary"}>
                    {raffle.status === 'finalized' ? "Finalizada" : "Activa"}
                  </Badge>
                </TableCell>
                <TableCell>{raffle.filledSlots} / 100</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        aria-haspopup="true" 
                        size="icon" 
                        variant="outline"
                        className="relative overflow-hidden group hover:bg-acento-fuerte hover:border-acento-fuerte transition-all duration-300"
                      >
                        <MoreHorizontal className="h-4 w-4 relative z-10 group-hover:rotate-90 transition-transform duration-300 group-hover:text-white" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/raffle/${raffle.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Tablero
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/raffle/${raffle.id}/details`}>
                          <Info className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </Link>
                      </DropdownMenuItem>
                      
                      {canEdit && (
                        <EditRaffleDialog
                          raffleId={raffle.id}
                          currentName={raffle.name}
                          currentDescription={raffle.description}
                          currentSlotPrice={raffle.slotPrice}
                          currentFinalizationDate={raffle.finalizationDate}
                        >
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </EditRaffleDialog>
                      )}
                      
                      {isOwner && raffle.status === 'active' && (
                        <FinalizeRaffleMenuItem raffle={raffle} />
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
