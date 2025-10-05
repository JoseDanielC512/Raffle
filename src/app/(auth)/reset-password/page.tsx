'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { confirmPasswordReset, verifyPasswordResetCode, applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { useRouter } from 'next/navigation';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(8, 'Confirmación de contraseña requerida'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  // Verificar el código de restablecimiento al cargar la página
  useEffect(() => {
    const code = searchParams.get('oobCode');
    const mode = searchParams.get('mode');
    
    logger.info('ResetPassword', 'Page loaded with parameters', {
      hasCode: !!code,
      mode,
      timestamp: new Date().toISOString()
    });

    if (!code) {
      logger.error('ResetPassword', 'No reset code provided', {
        mode,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: 'Enlace Inválido',
        description: 'El enlace de restablecimiento es inválido o ha expirado.',
        variant: 'destructive',
      });
      setIsVerifying(false);
      return;
    }

    setOobCode(code);

    const verifyCode = async () => {
      try {
        logger.info('ResetPassword', 'Verifying reset code', {
          code: code.substring(0, 10) + '...',
          timestamp: new Date().toISOString()
        });

        // Verificar el código y obtener el email
        const verifiedEmail = await verifyPasswordResetCode(auth, code);
        
        logger.info('ResetPassword', 'Reset code verified successfully', {
          email: verifiedEmail,
            timestamp: new Date().toISOString()
        });

        setEmail(verifiedEmail);
        setIsCodeValid(true);
        
        toast({
          title: 'Enlace Verificado',
          description: `Por favor, ingresa tu nueva contraseña para ${verifiedEmail}`,
          variant: 'success',
        });

      } catch (error: unknown) {
        logger.error('ResetPassword', 'Reset code verification failed', {
          code: code.substring(0, 10) + '...',
          error,
          timestamp: new Date().toISOString()
        });

        toast({
          title: 'Enlace Inválido o Expirado',
          description: 'El enlace de restablecimiento ha expirado o es inválido. Solicita uno nuevo.',
          variant: 'destructive',
        });
        setIsCodeValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [searchParams, toast]);

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!oobCode || !isCodeValid) {
      logger.error('ResetPassword', 'Attempted reset without valid code', {
        hasCode: !!oobCode,
        isValid: isCodeValid,
        timestamp: new Date().toISOString()
      });
      return;
    }

    const startTime = Date.now();
    setIsSubmitting(true);
    
    logger.info('ResetPassword', 'Password reset process started', {
      email,
      timestamp: new Date().toISOString()
    });

    try {
      logger.info('ResetPassword', 'Applying password reset', {
        email,
        code: oobCode.substring(0, 10) + '...',
        timestamp: new Date().toISOString()
      });

      // Aplicar el restablecimiento de contraseña
      await confirmPasswordReset(auth, oobCode, data.password);

      const duration = Date.now() - startTime;
      
      logger.info('ResetPassword', 'Password reset completed successfully', {
        email,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      toast({
        title: 'Contraseña Restablecida',
        description: 'Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión.',
        variant: 'success',
        duration: 6000,
      });

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      
      logger.error('ResetPassword', 'Password reset failed', {
        email,
        duration: `${duration}ms`,
        error,
        timestamp: new Date().toISOString()
      });

      let errorMessage = 'Ocurrió un error al restablecer tu contraseña. Intenta nuevamente.';
      
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        
        logger.warn('ResetPassword', 'Firebase error during reset', {
          email,
          errorCode: firebaseError.code,
          errorMessage: firebaseError.message,
          timestamp: new Date().toISOString()
        });

        switch (firebaseError.code) {
          case 'auth/expired-action-code':
            errorMessage = 'El enlace ha expirado. Solicita un nuevo enlace de restablecimiento.';
            break;
          case 'auth/invalid-action-code':
            errorMessage = 'El enlace es inválido. Solicita un nuevo enlace de restablecimiento.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Esta cuenta ha sido deshabilitada. Contacta al soporte.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No se encontró la cuenta. Verifica el correo electrónico.';
            break;
          case 'auth/weak-password':
            errorMessage = 'La contraseña es muy débil. Elige una contraseña más segura.';
            break;
          default:
            errorMessage = `Error: ${firebaseError.message || 'Error desconocido'}`;
            break;
        }
      }

      toast({
        title: 'Error al Restablecer',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });

    } finally {
      setIsSubmitting(false);
      
      logger.info('ResetPassword', 'Password reset process completed', {
        email,
        totalDuration: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });
    }
  };

  if (isVerifying) {
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
            Verificando Enlace
          </CardTitle>
          <CardDescription>
            Estamos verificando la seguridad del enlace...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!isCodeValid) {
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
          <CardTitle className="text-2xl font-bold text-destructive">
            Enlace Inválido
          </CardTitle>
          <CardDescription>
            El enlace de restablecimiento ha expirado o es inválido.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Por favor, solicita un nuevo enlace de restablecimiento de contraseña.
          </p>
          <div className='space-y-4'>
            <div>
              <Link href="/forgot-password">
                <Button className="w-full">
                  Solicitar Nuevo Enlace
                </Button>
              </Link>
            </div>
            <div>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Volver al Inicio de Sesión
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
          Nueva Contraseña
        </CardTitle>
        <CardDescription>
          Ingresa tu nueva contraseña para <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Ingresa tu nueva contraseña"
              showPasswordToggle={true}
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="Confirma tu nueva contraseña"
              showPasswordToggle={true}
              {...register('confirmPassword')}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando contraseña...
              </>
            ) : (
              'Actualizar Contraseña'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="underline text-primary">Volver al inicio de sesión</Link>
        </div>
        
        {/* Información adicional para el usuario */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <p className="mb-1">🔒 <strong>Recomendaciones de seguridad:</strong></p>
          <ul className="space-y-1 ml-4">
            <li>• Usa al menos 8 caracteres</li>
            <li>• Combina letras, números y símbolos</li>
            <li>• Evita usar información personal</li>
            <li>• No reuses contraseñas de otros sitios</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
