'use client';

import React, { useState } from 'react';
import { Controller, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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
import { TermsDialog } from '@/components/auth/terms-dialog';

const signupSchema = z.object({
  name: z.string().min(1, 'Nombre completo requerido'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(8, 'Confirmación de contraseña requerida'),
  terms: z.boolean().refine((val) => val === true, 'Debes aceptar los términos y condiciones'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const { register, handleSubmit, formState: { errors }, control, setError } = form;

  const handleSignup = async (data: SignupFormData) => {
    const { name, email, password } = data;
    setIsFormSubmitting(true);
    
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name,
        email,
        createdAt: new Date().toISOString()
      });

      // The user is already signed in after createUserWithEmailAndPassword.
      // No need to call signInWithEmailAndPassword again, which can cause race conditions with updateProfile.
      
      toast({
        title: '¡Cuenta Creada!',
        description: 'Tu cuenta ha sido creada y has iniciado sesión.',
        variant: 'success',
      });
      
      router.push('/dashboard');
    } catch (error: unknown) {
      let errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo más tarde.';
      
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = 'Este correo ya está en uso.';
          setError('email', { message: errorMessage });
        } else if (firebaseError.code === 'auth/weak-password') {
          errorMessage = 'La contraseña es muy débil.';
          setError('password', { message: errorMessage });
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'El correo electrónico no es válido.';
          setError('email', { message: errorMessage });
        }
      }
      
      toast({
        title: 'Error de Registro',
        description: errorMessage,
        variant: 'destructive',
      });
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
    <>
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
            Crea Tu Cuenta
          </CardTitle>
          <CardDescription>
            Únete para empezar a crear y participar en rifas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" type="text" placeholder="Tu nombre completo" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirma tu contraseña" showPasswordToggle={true} {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
              </div>
              
              <Controller
                name="terms"
                control={control}
                render={({ field }) => (
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Acepto los <button 
                          type="button" 
                          className="underline text-acento-fuerte hover:cursor-pointer" 
                          onClick={() => setShowTerms(true)}
                        >
                          términos y condiciones
                        </button>
                      </label>
                      {errors.terms && <p className="text-xs text-destructive mt-1">{errors.terms.message}</p>}
                    </div>
                  </div>
                )}
              />

              <Button type="submit" className="w-full" disabled={isFormSubmitting || authLoading}>
                {isFormSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando Cuenta...</>
                ) : (
                  'Crear Cuenta'
                )}
              </Button>
            </form>
          </FormProvider>
          <div className="mt-6 text-center text-sm">
            ¿Ya tienes una cuenta? <Link href="/login" className="underline text-acento-fuerte">Inicia Sesión</Link>
          </div>
        </CardContent>
      </Card>
      
      <TermsDialog open={showTerms} onOpenChange={setShowTerms} />
    </>
  );
}
