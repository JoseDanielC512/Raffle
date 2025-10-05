'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
import { logger } from '@/lib/logger';

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
    const startTime = Date.now();
    setIsFormSubmitting(true);
    
    // Log de inicio del proceso de login
    logger.info('Login', 'Login process started', {
      email: data.email,
      rememberMe,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    try {
      const { email, password } = data;
      
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      logger.info('Login', 'Attempting sign in with email and password', {
        email,
        persistence: rememberMe ? 'local' : 'session',
        timestamp: new Date().toISOString()
      });

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      logger.info('Login', 'Sign in successful', {
        email,
        uid: userCredential.user.uid,
        hasDisplayName: !!userCredential.user.displayName,
        timestamp: new Date().toISOString()
      });

      // Check if displayName is missing and try to update it from Firestore
      if (!userCredential.user.displayName) {
        try {
          const userDocRef = doc(db, 'users', userCredential.user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.name) {
              await updateProfile(userCredential.user, { displayName: userData.name });
              // Force a refresh of the user object to reflect changes in AuthContext
              await userCredential.user.reload();
            }
          }
        } catch (firestoreError) {
          // Silently fail if we can't fetch/update from Firestore, as it's not critical for login
          console.error('Error updating user profile from Firestore:', firestoreError);
        }
      }

      const duration = Date.now() - startTime;
      
      logger.info('Login', 'Login process completed successfully', {
        email,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      toast({
        title: '¡Bienvenido de Nuevo!',
        description: 'Has iniciado sesión correctamente.',
        variant: 'success',
      });
      router.push('/dashboard');
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      let description = 'Ocurrió un error inesperado. Por favor, inténtalo más tarde.';
      let errorType = 'unknown';
      
      // Log detallado del error
      logger.error('Login', 'Login process failed', {
        email: data.email,
        duration: `${duration}ms`,
        error: error,
        timestamp: new Date().toISOString()
      });
      
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        errorType = 'firebase';
        
        logger.warn('Login', 'Firebase error occurred', {
          email: data.email,
          errorCode: firebaseError.code,
          errorMessage: firebaseError.message,
          timestamp: new Date().toISOString()
        });
        
        switch (firebaseError.code) {
          case 'auth/invalid-credential':
            description = 'Esta contraseña ha sido cambiada recientemente. Si olvidaste tu contraseña, usa el enlace de recuperación.';
            errorType = 'password-changed';
            break;
          case 'auth/wrong-password':
            description = 'Contraseña incorrecta. Verifica tus credenciales.';
            errorType = 'wrong-password';
            break;
          case 'auth/user-not-found':
            description = 'No se encontró una cuenta con este correo electrónico.';
            errorType = 'user-not-found';
            break;
          case 'auth/too-many-requests':
            description = 'Demasiados intentos fallidos. Por favor, espera unos minutos antes de intentar nuevamente.';
            errorType = 'too-many-requests';
            break;
          case 'auth/network-request-failed':
            description = 'Error de conexión. Verifica tu internet e inténtalo nuevamente.';
            errorType = 'network-error';
            break;
          default:
            description = `Error: ${firebaseError.message || 'Código desconocido'}`;
            errorType = 'unknown-firebase';
            break;
        }
      }
      
      // Log del error procesado
      logger.error('Login', 'Processed error for user', {
        email: data.email,
        errorType,
        errorMessage: description,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: 'Error de Autenticación',
        description,
        variant: 'destructive',
      });
      
      // Mensaje de error específico según el tipo
      const errorMessage = errorType === 'password-changed' 
        ? 'Contraseña actualizada recientemente'
        : 'Credenciales inválidas';
      
      setError('password', { message: errorMessage });
    } finally {
      setIsFormSubmitting(false);
      
      // Log de finalización del proceso
      logger.info('Login', 'Login process finished', {
        email: data.email,
        totalDuration: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });
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
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="Introduce tu contraseña" showPasswordToggle={true} {...register('password')} />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            
            <div className="flex flex-col space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(Boolean(checked))} />
                <Label htmlFor="remember" className="text-sm">Recuérdame</Label>
              </div>
              <Link href="/forgot-password" className="text-sm underline text-acento-fuerte">¿Olvidaste tu contraseña?</Link>
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
          ¿No tienes una cuenta? <Link href="/signup" className="underline text-acento-fuerte">Regístrate</Link>
        </div>
      </CardContent>
    </Card>
  );
}
