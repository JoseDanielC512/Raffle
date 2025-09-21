'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateDetailsAction, createRaffleAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function GenerationSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</>
      ) : (
        'Generar con IA'
      )}
    </Button>
  );
}

function RaffleSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando Rifa...</>
      ) : (
        'Crear Rifa'
      )}
    </Button>
  );
}

export function CreateRaffleForm() {
  const { user, loading: authLoading } = useAuth();
  const [generateState, generateDispatch] = useActionState(generateDetailsAction, { message: null });
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [finalizationDate, setFinalizationDate] = useState<Date | undefined>();
  const [idToken, setIdToken] = useState('');

  useEffect(() => {
    if (generateState.name) setName(generateState.name);
    if (generateState.description) setDescription(generateState.description);
    if (generateState.terms) setTerms(generateState.terms);
  }, [generateState]);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setIdToken);
    }
  }, [user]);

  const isFormDisabled = authLoading || !user;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card className="bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="bg-muted/30 rounded-t-lg border-b border-border/50 pb-4">
            <CardTitle className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base">Generador de Contenido con IA</CardTitle>
            <CardDescription>Describe el premio y la IA creará los textos por ti.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <form action={generateDispatch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">¿Qué vas a rifar?</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  placeholder="Ej: Una consola PS5 nueva con dos controles y el juego Spider-Man 2."
                  className="min-h-[100px]"
                  disabled={isFormDisabled}
                />
                {generateState.errors?.prompt && (
                  <p className="text-sm text-red-500">{generateState.errors.prompt.join(', ')}</p>
                )}
              </div>
              <GenerationSubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <form action={createRaffleAction} className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="bg-muted/30 rounded-t-lg border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 flex items-center gap-2">Detalles de la Rifa</CardTitle>
              <CardDescription>Completa la información para tu nueva rifa.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {isFormDisabled && (
                <p className="text-sm text-center text-yellow-600 bg-yellow-50 p-3 rounded-md">
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
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
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
                      disabled={isFormDisabled}
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
          <RaffleSubmitButton />
        </form>
      </div>
    </div>
  );
}
