'use client';

import React, { useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trophy, Loader2 } from 'lucide-react';
import { useActionState } from 'react';
import { finalizeRaffleWithWinnerAction } from '@/app/actions';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

const DeclareWinnerSchema = z.object({
  winnerSlotNumber: z.coerce
    .number()
    .int()
    .min(1, 'El número de casilla debe ser al menos 1.')
    .max(100, 'El número de casilla no puede ser mayor a 100.'),
});

type DeclareWinnerFormValues = z.infer<typeof DeclareWinnerSchema>;

interface DeclareWinnerDialogProps {
  raffleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void; // Callback para refrescar datos o realizar otra acción tras el éxito
}

export default function DeclareWinnerDialog({
  raffleId,
  open,
  onOpenChange,
  onSuccess,
}: DeclareWinnerDialogProps) {
  const { user } = useAuth();
  const [idToken, setIdToken] = useState('');
  const { toast } = useToast();

  const form = useForm<DeclareWinnerFormValues>({
    resolver: zodResolver(DeclareWinnerSchema),
    defaultValues: {
      winnerSlotNumber: 0,
    },
  });

  const handleFinalize = async (prevState: ActionReturnType, formData: FormData) => {
    const result = await finalizeRaffleWithWinnerAction(formData);
    return { ...result, pending: false };
  };
  type ActionReturnType = { message: string; success: boolean; pending: boolean };
  const initialState: ActionReturnType = { message: '', success: false, pending: false };
  const [finalizeState, finalizeDispatch] = useActionState<ActionReturnType, FormData>(handleFinalize, initialState);

  // Obtener el token de ID cuando el usuario cambia o el componente se monta
  React.useEffect(() => {
    if (user) {
      user.getIdToken().then(setIdToken);
    }
  }, [user]);

  // Manejar el resultado de la Server Action
  React.useEffect(() => {
    if (finalizeState.success && finalizeState.message) {
      toast({
        title: '¡Finalizado!',
        description: finalizeState.message,
        className: 'bg-green-600 text-white border-green-700',
      });
      onOpenChange(false); // Cerrar el modal
      onSuccess(); // Llamar al callback de éxito
      form.reset(); // Resetear el formulario
    } else if (!finalizeState.success && finalizeState.message) {
      toast({
        title: 'Error al finalizar',
        description: finalizeState.message,
        variant: 'destructive',
        className: 'bg-red-600 text-white border-red-700',
      });
    }
  }, [finalizeState, toast, onOpenChange, onSuccess, form]);

  const onSubmit = (data: DeclareWinnerFormValues) => {
    startTransition(() => {
      const formData = new FormData();
      formData.append('raffleId', raffleId);
      formData.append('winnerSlotNumber', data.winnerSlotNumber.toString());
      formData.append('idToken', idToken);
      finalizeDispatch(formData);
    });
  };

  // Resetear el formulario cuando el diálogo se cierra
  const handleDialogOpenChange = (newOpenState: boolean) => {
    onOpenChange(newOpenState);
    if (!newOpenState) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-xs min-h-[40vh] p-4 sm:p-6 sm:max-w-[425px] rounded-lg bg-background border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-600">
            <Trophy className="h-5 w-5" />
            Declarar Ganador
          </DialogTitle>
          <DialogDescription>
            Ingresa el número de la casilla ganadora. Esta acción es irreversible y finalizará la rifa.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" name="raffleId" value={raffleId} />
            <input type="hidden" name="idToken" value={idToken} />
            <FormField
              control={form.control}
              name="winnerSlotNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Casilla Ganadora</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 55"
                      min="1"
                      max="100"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={finalizeState.pending || finalizeState.success}>
                {finalizeState.pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizando...
                  </>
                ) : finalizeState.success ? (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    ¡Finalizado!
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    Declarar Ganador y Finalizar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
