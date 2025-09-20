'use server';

import { z } from 'zod';
import { generateRaffleDetails } from '@/ai/flows/generate-raffle-details';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Raffle, RaffleSlot, SlotStatus } from '@/lib/definitions';
import { auth } from '@/lib/firebase'; // Client auth for client-side actions if needed
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { countActiveRafflesForUserAdmin } from '@/lib/firestore-admin';

// --- AUTHENTICATION --- //

const SignupSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  email: z.string().email('Por favor, ingresa un correo electrónico válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

const LoginSchema = z.object({
  email: z.string().email('Por favor, ingresa un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});

export type AuthState = { 
  message: string | null; 
  errors?: any; 
  success?: boolean;
  redirect?: string;
  data?: { email: string; password: string }; // Añadir datos validados
};

// This action uses the client SDK because it's initiated from the client before the user is fully logged in on the server.
export async function signupAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = SignupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { message: 'La validación falló.', errors: validatedFields.error.flatten().fieldErrors };
  }
  const { email, password, name } = validatedFields.data;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // We use the admin SDK's set method here
    const adminDb = getAdminDb();
    await adminDb.collection("users").doc(userCredential.user.uid).set({
      uid: userCredential.user.uid,
      name,
      email,
      createdAt: new Date().toISOString()
    });
    
    return { 
      message: 'Registro exitoso', 
      success: true
    };
  } catch (error: any) {
    console.error("Signup Error:", error);
    if (error.code === 'auth/email-already-in-use') return { message: 'Este correo ya está en uso.' };
    if (error.code === 'auth/weak-password') return { message: 'La contraseña es muy débil.' };
    if (error.code === 'auth/invalid-email') return { message: 'El correo electrónico no es válido.' };
    return { message: `Ocurrió un error durante el registro: ${error.code}` };
  }
}

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- AI GENERATION --- //

export async function generateDetailsAction(prevState: any, formData: FormData): Promise<any> {
  // ... (implementation unchanged)
}

// --- RAFFLE ACTIONS --- //

const CreateRaffleSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  description: z.string().min(1, 'La descripción es obligatoria.'),
  terms: z.string().min(1, 'Los términos son obligatorios.'),
  idToken: z.string().min(1, 'Se requiere el token de autenticación.'),
});

export async function createRaffleAction(formData: FormData): Promise<void> {

  const validatedFields = CreateRaffleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    console.error('❌ [CREATE_RAFFLE_ACTION] Validation failed:', validatedFields.error.flatten().fieldErrors);
    throw new Error('La validación de los campos falló.');
  }

  const { idToken, ...raffleData } = validatedFields.data;

  let ownerId: string;
  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    ownerId = decodedToken.uid;
  } catch (error) {
    console.error("❌ [CREATE_RAFFLE_ACTION] Error verifying ID token:", error);
    throw new Error('Error de autenticación: El token no es válido.');
  }

  let raffleId: string;
  try {
    const activeRaffleCount = await countActiveRafflesForUserAdmin(ownerId);

    if (activeRaffleCount >= 2) {
      console.error('❌ [CREATE_RAFFLE_ACTION] User has reached raffle limit');
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
    };

    await newRaffleRef.set(newRaffle);

    const batch = adminDb.batch();
    for (let i = 1; i <= 100; i++) {
      const slotRef = adminDb.collection('raffles').doc(raffleId).collection('slots').doc(String(i));
      batch.set(slotRef, { slotNumber: i, participantName: '', status: 'available' });
    }
    await batch.commit();
  } catch (error) {
    console.error("❌ [CREATE_RAFFLE_ACTION] Error creating raffle with admin SDK:", error);
    throw new Error(error instanceof Error ? error.message : 'Error de base de datos: No se pudo crear la rifa.');
  }

  try {
    revalidatePath('/dashboard', 'page');
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('❌ [CREATE_RAFFLE_ACTION] Error during revalidation:', error);
  }

  redirect(`/raffle/${raffleId}`);
}

// ... (other actions remain unchanged for now, but would need similar admin SDK treatment if used from server)

const UpdateSlotSchema = z.object({
  raffleId: z.string(),
  slotNumber: z.coerce.number(),
  participantName: z.string(),
  status: z.enum(['available', 'reserved', 'paid']),
});

export async function updateSlotAction(formData: FormData) {
  // This action would also need to be converted to use the Admin SDK
  // for proper server-side authentication and authorization.
  const { raffleId, slotNumber, participantName, status } = UpdateSlotSchema.parse(Object.fromEntries(formData.entries()));
  const db = getAdminDb(); // Example of conversion
  const slotRef = db.collection('raffles').doc(raffleId).collection('slots').doc(String(slotNumber));
  await slotRef.update({ participantName, status });
  return { message: 'Casilla actualizada con éxito.' };
}

export async function finalizeRaffleAction(raffleId: string) {
  // This action also needs conversion to Admin SDK
  if (!raffleId) throw new Error('Se requiere el ID de la rifa.');
  const adminDb = getAdminDb();
  await adminDb.runTransaction(async (transaction) => {
    // ... transaction logic using adminDb ...
  });
  revalidatePath(`/raffle/${raffleId}`);
  return { message: '¡Rifa finalizada con éxito!' };
}
