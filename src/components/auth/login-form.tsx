'use client';

import React from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from 'react';
import { loginAction, type AuthState } from '@/app/actions';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const initialState: AuthState = { message: null, errors: {} };
      const result = await loginAction(initialState, formData);

      if (result.success && result.data) {
        const { email, password } = result.data;
        try {
          // Autenticamos directamente en el cliente
          await signInWithEmailAndPassword(auth, email, password);
          // Navegamos al dashboard. El AuthContext se actualizará automáticamente.
          router.push('/dashboard');
        } catch (authError: any) {
          setError('Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.');
        }
      } else {
        // Si hay un mensaje de error, lo mostramos.
        if (result.message) {
          setError(result.message);
        }
      }
    });
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico a continuación para iniciar sesión en tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Contraseña</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
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
