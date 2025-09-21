'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { Pencil, Save } from 'lucide-react';

import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const EditRaffleSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  description: z.string().min(1, 'La descripción es obligatoria.'),
});

type EditRaffleFormValues = z.infer<typeof EditRaffleSchema>;

interface EditRaffleDialogProps {
  raffleId: string;
  currentName: string;
  currentDescription: string;
  children: React.ReactNode;
}

export default function EditRaffleDialog({
  raffleId,
  currentName,
  currentDescription,
  children,
}: EditRaffleDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditRaffleFormValues>({
    resolver: zodResolver(EditRaffleSchema),
    defaultValues: {
      name: currentName,
      description: currentDescription,
    },
  });

  const onSubmit = async (data: EditRaffleFormValues) => {
    setIsLoading(true);
    try {
      const raffleRef = doc(db, 'raffles', raffleId);
      await updateDoc(raffleRef, {
        name: data.name,
        description: data.description,
      });

      toast({
        title: 'Rifa actualizada',
        description: 'Los cambios se han guardado correctamente.',
        className: 'bg-green-600 text-white border-green-700',
      });
      setOpen(false); // Cerrar el modal al guardar
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la rifa. Inténtalo de nuevo.',
        variant: 'destructive',
        className: 'bg-red-600 text-white border-red-700',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear el formulario con los valores actuales cuando se abre el modal
  const handleOpenChange = (newOpenState: boolean) => {
    setOpen(newOpenState);
    if (newOpenState) {
      form.reset({
        name: currentName,
        description: currentDescription,
      });
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
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Rifa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la rifa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe tu rifa"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
