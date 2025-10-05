'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
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
import { sendPasswordResetEmail,ActionCodeSettings } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logger } from '@/lib/logger';

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
    const startTime = Date.now();
    setIsSubmitting(true);
    
    // Log de inicio del proceso
    logger.info('ForgotPassword', 'Password reset process started', {
      email: data.email,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    try {
      // Configuración de ActionCodeSettings para controlar el flujo de redirección
      const actionCodeSettings: ActionCodeSettings = {
        url: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:9002/reset-password'  // Desarrollo: localhost
          : 'https://rifas-online-f2668.firebaseapp.com/reset-password', // Producción: dominio Firebase
        handleCodeInApp: false, // Manejar en la web, no en app móvil
        iOS: {
          bundleId: 'com.lucky100.app' // Opcional: para iOS si se tiene app
        },
        android: {
          packageName: 'com.lucky100.app', // Opcional: para Android si se tiene app
          installApp: true
        }
      };

      logger.info('ForgotPassword', 'Sending password reset email', {
        email: data.email,
        actionCodeSettings,
        redirectUrl: actionCodeSettings.url
      });

      // Enviar correo de restablecimiento con configuración específica
      await sendPasswordResetEmail(auth, data.email, actionCodeSettings);

      const duration = Date.now() - startTime;
      
      // Log de éxito
      logger.info('ForgotPassword', 'Password reset email sent successfully', {
        email: data.email,
        duration: `${duration}ms`,
        redirectUrl: actionCodeSettings.url,
        timestamp: new Date().toISOString()
      });

      // Toast de éxito para el usuario
      toast({
        title: 'Correo Enviado',
        description: 'Hemos enviado un enlace de restablecimiento a tu correo electrónico. Revisa tu bandeja de entrada y spam.',
        variant: 'success',
        duration: 6000, // 6 segundos para dar tiempo de leer
      });

    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      let errorMessage = 'Ocurrió un error. Por favor, inténtalo más tarde.';
      let errorType = 'unknown';
      
      // Log detallado del error
      logger.error('ForgotPassword', 'Password reset failed', {
        email: data.email,
        duration: `${duration}ms`,
        error: error,
        timestamp: new Date().toISOString()
      });

      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        errorType = 'firebase';
        
        logger.warn('ForgotPassword', 'Firebase error occurred', {
          email: data.email,
          errorCode: firebaseError.code,
          errorMessage: firebaseError.message,
          timestamp: new Date().toISOString()
        });

        switch (firebaseError.code) {
          case 'auth/user-not-found':
            errorMessage = 'No se encontró una cuenta con este correo electrónico.';
            setError('email', { message: errorMessage });
            errorType = 'user-not-found';
            break;
            
          case 'auth/invalid-email':
            errorMessage = 'Dirección de correo electrónico inválida.';
            setError('email', { message: errorMessage });
            errorType = 'invalid-email';
            break;
            
          case 'auth/too-many-requests':
            errorMessage = 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.';
            errorType = 'too-many-requests';
            break;
            
          case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifica tu internet e inténtalo nuevamente.';
            errorType = 'network-error';
            break;
            
          default:
            errorMessage = `Error: ${firebaseError.message || 'Código desconocido'}`;
            errorType = 'unknown-firebase';
            break;
        }
      }

      // Log del error procesado
      logger.error('ForgotPassword', 'Processed error for user', {
        email: data.email,
        errorType,
        errorMessage,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      // Toast de error para el usuario
      toast({
        title: 'Error al Restablecer',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });

    } finally {
      setIsSubmitting(false);
      
      // Log de finalización del proceso
      logger.info('ForgotPassword', 'Password reset process completed', {
        email: data.email,
        totalDuration: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <Card className="mx-auto w-[400px] bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/static/logo.png"
            alt="Lucky 100 Logo"
            width={120}
            height={120}
            className="h-20 w-auto"
          />
        </div>
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
            <Input 
              id="email" 
              type="email" 
              placeholder="correo@ejemplo.com" 
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando correo...
              </>
            ) : (
              'Enviar enlace de restablecimiento'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="underline text-primary">Volver al inicio de sesión</Link>
        </div>
        
        {/* Información adicional para el usuario */}
        <div className="mt-4 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <p className="mb-1">📧 <strong>Importante:</strong></p>
          <ul className="space-y-1 ml-4">
            <li>• Revisa tu bandeja de entrada y spam</li>
            <li>• El enlace expirará en 24 horas</li>
            <li>• Si no recibes el correo, verifica que el email esté registrado</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
