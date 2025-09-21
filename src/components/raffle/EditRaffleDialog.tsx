'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Save } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateRaffleAction } from '@/app/actions';

import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

interface EditRaffleDialogProps {
  raffleId: string;
  currentName: string;
  currentDescription: string;
  currentFinalizationDate: string | null;
  children: React.ReactNode;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Guardando...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </>
      )}
    </Button>
  );
}

export default function EditRaffleDialog({
  raffleId,
  currentName,
  currentDescription,
  currentFinalizationDate,
  children,
}: EditRaffleDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [idToken, setIdToken] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    currentFinalizationDate ? new Date(currentFinalizationDate) : null
  );

  const { toast } = useToast();
  
  const [updateState, updateDispatch] = useActionState(updateRaffleAction, { message: '', success: false });

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setIdToken);
    }
  }, [user]);

  useEffect(() => {
    if (updateState.success && updateState.message) {
      toast({
        title: 'Rifa actualizada',
        description: updateState.message,
        className: 'bg-green-600 text-white border-green-700',
      });
      setOpen(false);
    } else if (!updateState.success && updateState.message) {
      toast({
        title: 'Error',
        description: updateState.message,
        variant: 'destructive',
        className: 'bg-red-600 text-white border-red-700',
      });
    }
  }, [updateState, toast]);

  const handleOpenChange = (newOpenState: boolean) => {
    setOpen(newOpenState);
    if (newOpenState) {
      setSelectedDate(currentFinalizationDate ? new Date(currentFinalizationDate) : null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xs min-h-[40vh] p-4 sm:p-6 sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Editar Rifa
          </DialogTitle>
          <DialogDescription>
            Modifica el nombre y la descripción de tu rifa. Los cambios se guardarán
            automáticamente.
          </DialogDescription>
        </DialogHeader>
        <form action={updateDispatch} className="space-y-6">
          <input type="hidden" name="raffleId" value={raffleId} />
          <input type="hidden" name="idToken" value={idToken} />
          <input type="hidden" name="finalizationDate" value={selectedDate ? selectedDate.toISOString() : ''} />
          
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Rifa</Label>
            <Input id="name" name="name" placeholder="Nombre de la rafa" defaultValue={currentName} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" placeholder="Describe tu rafa" className="resize-none min-h-[120px]" defaultValue={currentDescription} required />
          </div>
          
          <div className="space-y-2">
            <Label>Fecha de Finalización (Opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  {selectedDate ? (
                    format(selectedDate, 'PPP', { locale: es })
                  ) : (
                    <span>Seleccionar una fecha</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate ?? undefined}
                  onSelect={(date) => setSelectedDate(date ?? null)}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0)) // Deshabilitar fechas pasadas
                  }
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
