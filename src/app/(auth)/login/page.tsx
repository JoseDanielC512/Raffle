'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, setError } = form;

  const handleLogin = async (data: LoginFormData) => {
    setIsFormSubmitting(true);
    try {
      const { email, password } = data;
      
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: '¡Bienvenido de Nuevo!',
        description: 'Has iniciado sesión correctamente.',
        variant: 'success',
      });
      router.push('/dashboard');
    } catch (error: unknown) {
      let description = 'Ocurrió un error inesperado. Por favor, inténtalo más tarde.';
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/wrong-password') {
          description = 'Contraseña incorrecta. Por favor, inténtalo de nuevo.';
        }
      }
      toast({
        title: 'Error de Autenticación',
        description,
        variant: 'destructive',
      });
      setError('password', { message: 'Credenciales inválidas' });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <Card className="mx-auto w-[400px] bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Inicia Sesión
        </CardTitle>
        <CardDescription>
          Bienvenido de nuevo, te extrañamos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="correo@ejemplo.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="Introduce tu contraseña" {...register('password')} />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            
            <div className="flex flex-col space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(Boolean(checked))} />
                <Label htmlFor="remember" className="text-sm">Recuérdame</Label>
              </div>
              <Link href="/forgot-password" className="text-sm underline text-primary">¿Olvidaste tu contraseña?</Link>
            </div>

            <Button type="submit" className="w-full" disabled={isFormSubmitting || authLoading}>
              {isFormSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Iniciando Sesión...</>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </FormProvider>
        <div className="mt-6 text-center text-sm">
          ¿No tienes una cuenta? <Link href="/signup" className="underline text-primary">Regístrate</Link>
        </div>
      </CardContent>
    </Card>
  );
}
