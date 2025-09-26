'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Raffle } from '@/lib/definitions';
import { auth } from '@/lib/firebase'; // Client auth for client-side actions if needed
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { countActiveRafflesForUserAdmin } from '@/lib/firestore-admin';

// --- AUTHENTICATION --- //

const SignupSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  email: z.string().email('Por favor, ingresa un correo electrónico válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  confirmPassword: z.string().min(8, 'La confirmación de contraseña es obligatoria.'),
  terms: z.boolean().refine((val) => val === true, 'Debes aceptar los términos y condiciones.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

const LoginSchema = z.object({
  email: z.string().email('Por favor, ingresa un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});

export type AuthState = { 
  message: string | null; 
  errors?: Record<string, string[] | undefined> | undefined; 
  success?: boolean;
  redirect?: string;
  data?: { email: string; password: string }; // Añadir datos validados
};

// This action uses the client SDK because it's initiated from the client before the user is fully logged in on the server.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function signupAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  // Convertir FormData a un objeto plano, usando una aserción de tipo para poder modificarlo
  const rawFormData = Object.fromEntries(formData.entries()) as Record<string, unknown>;
  
  // Convertir explícitamente el campo 'terms' de string a booleano
  if (rawFormData.terms === 'true') {
    rawFormData.terms = true;
  } else {
    rawFormData.terms = false;
  }

  const validatedFields = SignupSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return { message: 'La validación falló.', errors: validatedFields.error.flatten().fieldErrors };
  }
  
  const { email, password, name } = validatedFields.data;
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    const adminAuth = getAdminAuth();
    await adminAuth.updateUser(userCredential.user.uid, {
      displayName: name,
    });

    // We use the admin SDK's set method here
    const adminDb = getAdminDb();
    try {
      await adminDb.collection("users").doc(userCredential.user.uid).set({
        uid: userCredential.user.uid,
        name,
        email,
        createdAt: new Date().toISOString()
      });
    } catch (firestoreError: unknown) {
      throw firestoreError; // Re-throw to be caught by the outer catch
    }
    
    return { 
      message: 'Registro exitoso', 
      success: true
    };
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/email-already-in-use') return { message: 'Este correo ya está en uso.' };
        if (firebaseError.code === 'auth/weak-password') return { message: 'La contraseña es muy débil.' };
        if (firebaseError.code === 'auth/invalid-email') return { message: 'El correo electrónico no es válido.' };
        return { message: `Ocurrió un error durante el registro: ${firebaseError.code}` };
    }
    return { message: 'Ocurrió un error durante el registro.' };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loginAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { message: 'La validación falló.', errors: validatedFields.error.flatten().fieldErrors };
  }
  const { email, password } = validatedFields.data;
  return { message: 'Validación exitosa', success: true, data: { email, password } };
}

export async function logoutAction() {
  try {
    await auth.signOut();
    return { success: true };
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        const logoutError = error as { message: string };
        return { success: false, error: logoutError.message };
    }
    return { success: false, error: 'An unknown error occurred.' };
  }
}

// --- AI GENERATION --- //

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateDetailsAction(_prevState: unknown, _formData: FormData): Promise<unknown> {
  // ... (implementation unchanged)
}

// --- RAFFLE ACTIONS --- //

const CreateRaffleSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  description: z.string().min(1, 'La descripción es obligatoria.'),
  terms: z.string().min(1, 'Los términos son obligatorios.'),
  finalizationDate: z.string().nullable().optional(), // Fecha de finalización en formato ISO string
  idToken: z.string().min(1, 'Se requiere el token de autenticación.'),
});

export async function createRaffleAction(formData: FormData): Promise<void> {

  const validatedFields = CreateRaffleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    throw new Error('La validación de los campos falló.');
  }

  const { idToken, ...raffleData } = validatedFields.data;

  let ownerId: string;
  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    ownerId = decodedToken.uid;
  } catch {
    throw new Error('Error de autenticación: El token no es válido.');
  }

  let raffleId: string;
  try {
    const activeRaffleCount = await countActiveRafflesForUserAdmin(ownerId);

    if (activeRaffleCount >= 2) {
      throw new Error('Has alcanzado el límite de 2 rifas activas. No puedes crear más rifas hasta finalizar una existente.');
    }

    const adminDb = getAdminDb();
    const newRaffleRef = adminDb.collection('raffles').doc();
    raffleId = newRaffleRef.id;

    const newRaffle: Omit<Raffle, 'id'> = {
      ...raffleData,
      ownerId,
      status: 'active',
      winnerSlotNumber: null,
      createdAt: new Date().toISOString(),
      finalizedAt: null,
      finalizationDate: raffleData.finalizationDate || null,
    };

    await newRaffleRef.set(newRaffle);

    const batch = adminDb.batch();
    for (let i = 1; i <= 100; i++) {
      const slotRef = adminDb.collection('raffles').doc(raffleId).collection('slots').doc(String(i));
      batch.set(slotRef, { slotNumber: i, participantName: '', status: 'available' });
    }
    await batch.commit();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error de base de datos: No se pudo crear la rifa.');
  }

  try {
    revalidatePath('/dashboard', 'page');
    revalidatePath('/', 'layout');
  } catch {
  }

  redirect(`/raffle/${raffleId}`);
}

// ... (other actions remain unchanged for now, but would need similar admin SDK treatment if used from server)

const UpdateSlotSchema = z.object({
  raffleId: z.string(),
  slotNumber: z.coerce.number(),
  participantName: z.string(),
  status: z.enum(['available', 'reserved', 'paid']),
  idToken: z.string().min(1, 'Se requiere el token de autenticación.'),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateSlotAction(_prevState: unknown, formData: FormData): Promise<{ message: string; success: boolean; }> {
  try {
    const validatedFields = UpdateSlotSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      throw new Error('La validación de los campos falló.');
    }

    const { raffleId, slotNumber, participantName, status, idToken } = validatedFields.data;

    let ownerId: string;
    try {
      const adminAuth = getAdminAuth();
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      ownerId = decodedToken.uid;
    } catch {
      return { message: 'Error de autenticación: El token no es válido.', success: false };
    }

    const adminDb = getAdminDb();
    const raffleRef = adminDb.collection('raffles').doc(raffleId);
    const raffleDoc = await raffleRef.get();

    if (!raffleDoc.exists) {
      return { message: 'Rifa no encontrada.', success: false };
    }

    const raffle = raffleDoc.data();
    if (!raffle) {
      return { message: 'Los datos de la rifa no se encontraron.', success: false };
    }

    if (raffle.ownerId !== ownerId) {
      return { message: 'No tienes permisos para editar esta casilla.', success: false };
    }

    const slotRef = adminDb.collection('raffles').doc(raffleId).collection('slots').doc(String(slotNumber));
    await slotRef.update({ 
      participantName: participantName || null,
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath(`/raffle/${raffleId}`);
    return { message: 'Casilla actualizada con éxito.', success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { message: `Error al actualizar la casilla: ${errorMessage}`, success: false };
  }
}

// --- RAFFLE UPDATE ACTION --- //

const UpdateRaffleSchema = z.object({
  raffleId: z.string().min(1, 'El ID de la rifa es obligatorio.'),
  name: z.string().min(1, 'El nombre es obligatorio.'),
  description: z.string().min(1, 'La descripción es obligatoria.'),
  finalizationDate: z.string().nullable().optional(), // Fecha de finalización en formato ISO string
  idToken: z.string().min(1, 'Se requiere el token de autenticación.'),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateRaffleAction(_prevState: unknown, formData: FormData): Promise<{ message: string; success: boolean }> {
  const validatedFields = UpdateRaffleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    // En un caso real, podrías querer devolver los errores de validación
    throw new Error('La validación de los campos falló.');
  }

  const { raffleId, idToken, ...updateData } = validatedFields.data;

  let ownerId: string;
  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    ownerId = decodedToken.uid;
  } catch {
    throw new Error('Error de autenticación: El token no es válido.');
  }

  const adminDb = getAdminDb();
  const raffleRef = adminDb.collection('raffles').doc(raffleId);
  const raffleDoc = await raffleRef.get();

  if (!raffleDoc.exists) {
    throw new Error('Rifa no encontrada.');
  }

  const raffle = raffleDoc.data();
  if (!raffle) {
    throw new Error('Los datos de la rifa no se encontraron.');
  }
  if (raffle.ownerId !== ownerId) {
    throw new Error('No tienes permisos para editar esta rifa.');
  }
  
  if (raffle.status === 'finalized') {
    throw new Error('No se puede editar una rifa que ya ha sido finalizada.');
  }

  try {
    await raffleRef.update({
      ...updateData,
      // Si finalizationDate es una cadena vacía, la guardamos como null.
      finalizationDate: updateData.finalizationDate === '' ? null : updateData.finalizationDate,
    });

    revalidatePath(`/raffle/${raffleId}`);
    revalidatePath('/dashboard');
    return { message: 'Rifa actualizada con éxito.', success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error de base de datos: No se pudo actualizar la rifa.');
  }
}

// --- RAFFLE FINALIZATION WITH WINNER ACTION --- //

const FinalizeRaffleWithWinnerSchema = z.object({
  raffleId: z.string().min(1, 'El ID de la rifa es obligatorio.'),
  winnerSlotNumber: z.coerce.number().int().min(1).max(100, 'El número de casilla debe estar entre 1 y 100.'),
  idToken: z.string().min(1, 'Se requiere el token de autenticación.'),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function finalizeRaffleWithWinnerAction(_prevState: unknown, formData: FormData): Promise<{ message: string; success: boolean }> {
  try {
    const validatedFields = FinalizeRaffleWithWinnerSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      // Simplified error handling for validation
      return { message: 'La validación de los campos falló.', success: false };
    }

    const { raffleId, winnerSlotNumber, idToken } = validatedFields.data;

    let ownerId: string;
    try {
      const adminAuth = getAdminAuth();
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      ownerId = decodedToken.uid;
    } catch {
      return { message: 'Error de autenticación: El token no es válido.', success: false };
    }

    const adminDb = getAdminDb();
    const raffleRef = adminDb.collection('raffles').doc(raffleId);
    const raffleDoc = await raffleRef.get();

    if (!raffleDoc.exists) {
      return { message: 'Rifa no encontrada.', success: false };
    }

    const raffle = raffleDoc.data();
    if (!raffle) {
      return { message: 'Los datos de la rifa no se encontraron.', success: false };
    }
    if (raffle.ownerId !== ownerId) {
      return { message: 'No tienes permisos para finalizar esta rifa.', success: false };
    }

    if (raffle.status === 'finalized') {
      return { message: 'Esta rifa ya ha sido finalizada.', success: false };
    }

    if (raffle.finalizationDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const finalizationDate = new Date(raffle.finalizationDate);
      finalizationDate.setHours(0, 0, 0, 0);

      if (today < finalizationDate) {
        return { message: 'La rifa solo puede ser finalizada a partir de su fecha de finalización programada.', success: false };
      }
    } else {
      return { message: 'Esta rifa no tiene una fecha de finalización programada.', success: false };
    }

    await raffleRef.update({
      status: 'finalized',
      winnerSlotNumber: winnerSlotNumber,
      finalizedAt: new Date().toISOString(),
    });

    revalidatePath(`/raffle/${raffleId}`);
    revalidatePath('/dashboard');
    return { message: '¡Rifa finalizada y ganador declarado!', success: true };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { message: `Error de base de datos: ${errorMessage}`, success: false };
  }
}
