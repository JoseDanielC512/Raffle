'use client';

import Link from "next/link";
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signupAction, type AuthState } from '@/app/actions';
import { useAuth } from '@/context/auth-context';
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

export function SignupForm() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const initialState: AuthState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(signupAction, initialState);

  useEffect(() => {
    if (state.success && user && !authLoading) {
      router.push('/dashboard');
    }
  }, [state.success, user, authLoading, router]);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Regístrate</CardTitle>
        <CardDescription>
          Ingresa tu información para crear una cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" name="name" placeholder="Max Robinson" required />
            {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name.join(', ')}</p>}
          </div>
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
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required/>
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
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="underline">
            Iniciar Sesión
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
      {pending ? 'Creando cuenta...' : 'Crear una cuenta'}
    </Button>
  );
}
