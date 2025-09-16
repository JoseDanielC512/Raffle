'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Bot, Loader2, Wand2 } from 'lucide-react';

import { generateDetailsAction, createRaffleAction } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

function Submit({ text, loadingText, variant = "default" }: { text: string; loadingText: string, variant?: "default" | "secondary" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant={variant}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  );
}

function GenerateButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Bot className="mr-2 h-4 w-4" />
            Generar Detalles con IA
          </>
        )}
      </Button>
    );
  }

export default function CreateRaffleForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(generateDetailsAction, initialState);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <form action={dispatch}>
          <CardHeader>
            <CardTitle className="font-headline">1. Describe Tu Premio</CardTitle>
            <CardDescription>
              Dile a nuestra IA qué estás rifando y generará un nombre, descripción y términos para ti.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full gap-2">
              <Label htmlFor="prompt">Prompt del Premio</Label>
              <Textarea
                id="prompt"
                name="prompt"
                placeholder="Ej: Una consola PS5 nueva con un control extra y tres juegos."
                rows={4}
                required
              />
              {state.errors?.prompt && (
                <p className="text-sm text-destructive">{state.errors.prompt}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <GenerateButton />
          </CardFooter>
        </form>
      </Card>

      <Card>
        <form action={createRaffleAction}>
          <CardHeader>
            <CardTitle className="font-headline">2. Revisa y Crea</CardTitle>
            <CardDescription>
              Revisa los detalles generados por la IA a continuación o llénalos manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Rifa</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Paquete PS5 para Gamers"
                defaultValue={state.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Una descripción corta y atractiva de tu premio."
                defaultValue={state.description}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Términos y Condiciones</Label>
              <Textarea
                id="terms"
                name="terms"
                placeholder="Ej: El ganador debe reclamar en 7 días. Solo para México."
                defaultValue={state.terms}
                rows={3}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
             <Submit text="Crear Rifa" loadingText="Creando..." />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
