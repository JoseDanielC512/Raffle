'use client';

import Link from "next/link";
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { loginAction, type AuthState } from '@/app/actions';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const initialState: AuthState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(loginAction, initialState);

  useEffect(() => {
    console.log('LoginForm useEffect:', { 
      success: state.success, 
      redirect: state.redirect, 
      message: state.message 
    });
    
    if (state.success && state.redirect) {
      console.log('Redirigiendo a:', state.redirect);
      // Esperar un momento para que el contexto de autenticación se actualice
      const timer = setTimeout(() => {
        console.log('Ejecutando router.push a:', state.redirect);
        router.push(state.redirect!);
      }, 1000); // Aumenté el tiempo a 1 segundo
      return () => clearTimeout(timer);
    }
  }, [state.success, state.redirect, router, state.message]);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico a continuación para iniciar sesión en tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
            {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email.join(', ')}</p>}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Contraseña</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
            {state.errors?.password && <p className="text-sm text-red-500">{state.errors.password.join(', ')}</p>}
          </div>
          {state.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          <SubmitButton />
        </form>
        <div className="mt-4 text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href="/signup" className="underline">
            Regístrate
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
    </Button>
  );
}
