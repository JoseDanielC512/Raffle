'use client';

import { useState, useEffect } from 'react';
import { generateDetailsAction, createRaffleAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Define the types for the action states
type GenerateState = {
  name?: string;
  description?: string;
  terms?: string;
  message?: string | null;
  errors?: Record<string, string[] | undefined> | undefined;
};

type CreateState = {
  message: string | null;
  success?: boolean;
  raffleId?: string;
};

function GenerationSubmitButton({ isGenerating }: { isGenerating: boolean }) {
  return (
    <Button type="submit" disabled={isGenerating} className="w-full md:w-auto">
      {isGenerating ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</>
      ) : (
        'Generar con IA'
      )}
    </Button>
  );
}

function RaffleSubmitButton({ isCreating }: { isCreating: boolean }) {
  return (
    <Button type="submit" disabled={isCreating} className="w-full">
      {isCreating ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando Rifa...</>
      ) : (
        'Crear Rifa'
      )}
    </Button>
  );
}

export function CreateRaffleForm() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [slotPrice, setSlotPrice] = useState<number>(1000); // Default value
  const [finalizationDate, setFinalizationDate] = useState<Date | undefined>();
  const [idToken, setIdToken] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generateErrors, setGenerateErrors] = useState<Record<string, string[] | undefined> | undefined>();

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setIdToken);
    }
  }, [user]);

  const handleGenerateSubmit = async (formData: FormData) => {
    setIsGenerating(true);
    setGenerateErrors(undefined);
    try {
      const result: GenerateState = await generateDetailsAction({ message: null }, formData);
      if (result.name) setName(result.name);
      if (result.description) setDescription(result.description);
      if (result.terms) setTerms(result.terms);
      if (result.errors) {
        setGenerateErrors(result.errors);
      }
    } catch {
      toast({
        title: 'Error de IA',
        description: 'No se pudo generar el contenido.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreating(true);
    const formData = new FormData(event.currentTarget);
    
    try {
      const result: CreateState = await createRaffleAction({ message: null }, formData);

      if (result.success && result.message) {
        toast({
          title: 'Rifa creada con éxito',
          description: result.message,
          variant: 'success',
        });
        if (result.raffleId) {
          router.push(`/raffle/${result.raffleId}`);
          router.refresh();
        }
      } else if (!result.success && result.message) {
        toast({
          title: 'Error al crear rifa',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error Inesperado',
        description: 'Ocurrió un error al crear la rifa.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const isFormDisabled = authLoading || !user;

  return (
    <div className="grid gap-8 md:grid-cols-1">
      <div className="md:col-span-1">
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="bg-muted/30 rounded-t-lg border-b border-border/50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 flex items-center gap-2">Detalles de la Rifa</CardTitle>
                <CardDescription>Completa la información para tu nueva rifa.</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generador de Contenido con IA</DialogTitle>
                  </DialogHeader>
                  <Card className="bg-card/80 backdrop-blur-sm border-border/60">
                    <CardHeader>
                      <CardDescription>Describe el premio y la IA creará los textos por ti.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <form onSubmit={(e) => { e.preventDefault(); handleGenerateSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="prompt">¿Qué vas a rifar?</Label>
                          <Textarea
                            id="prompt"
                            name="prompt"
                            placeholder="Ej: Una consola PS5 nueva con dos controles y el juego Spider-Man 2."
                            className="min-h-[100px]"
                            disabled={isFormDisabled || isGenerating}
                          />
                          {generateErrors?.prompt && (
                            <p className="text-sm text-acento-calido">{generateErrors.prompt.join(', ')}</p>
                          )}
                        </div>
                        <GenerationSubmitButton isGenerating={isGenerating} />
                      </form>
                    </CardContent>
                  </Card>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {isFormDisabled && (
                <p className="text-sm text-center text-acento-calido bg-acento-calido/10 p-3 rounded-md border border-acento-calido/30">
                  Debes iniciar sesión para poder crear una rifa.
                </p>
              )}
              <input type="hidden" name="idToken" value={idToken} />
              <input type="hidden" name="finalizationDate" value={finalizationDate ? finalizationDate.toISOString() : ''} />
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Rifa</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Rifa Increíble de PS5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isFormDisabled || isCreating}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slotPrice">Precio de la Casilla (COP)</Label>
                <Input 
                  id="slotPrice" 
                  name="slotPrice" 
                  type="number"
                  placeholder="1000"
                  value={slotPrice}
                  onChange={(e) => setSlotPrice(Number(e.target.value))}
                  disabled={isFormDisabled || isCreating}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe los detalles emocionantes de tu rifa aquí."
                  className="min-h-[120px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isFormDisabled || isCreating}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Términos y Condiciones</Label>
                <Textarea
                  id="terms"
                  name="terms"
                  placeholder="Define las reglas: fecha del sorteo, cómo se elegirá al ganador, etc."
                  className="min-h-[100px]"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  disabled={isFormDisabled || isCreating}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Finalización (Opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !finalizationDate && 'text-muted-foreground'
                      )}
                      disabled={isFormDisabled || isCreating}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {finalizationDate ? format(finalizationDate, 'PPP', { locale: es }) : <span>Seleccionar una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={finalizationDate}
                        onSelect={setFinalizationDate}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0)) // Deshabilitar fechas pasadas
                        }
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
          <RaffleSubmitButton isCreating={isCreating} />
        </form>
      </div>
    </div>
  );
}
