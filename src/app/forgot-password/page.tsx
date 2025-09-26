'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, setError } = form;

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({
        title: 'Correo Enviado',
        description: 'Hemos enviado un enlace de restablecimiento a tu correo electrónico.',
        variant: 'info',
      });
    } catch (error: unknown) {
      let errorMessage = 'Ocurrió un error. Por favor, inténtalo más tarde.';
      
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/user-not-found') {
          errorMessage = 'No se encontró una cuenta con este correo electrónico.';
          setError('email', { message: errorMessage });
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Dirección de correo electrónico inválida.';
          setError('email', { message: errorMessage });
        }
      }
      
      toast({
        title: 'Error al Restablecer',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto w-[400px] bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Recuperar Contraseña
          </CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="correo@ejemplo.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando correo...</>
              ) : (
                'Enviar enlace de restablecimiento'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="underline text-primary">Volver al inicio de sesión</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
