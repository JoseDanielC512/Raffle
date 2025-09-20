'use server';

import { z } from 'zod';
import { generateRaffleDetails } from '@/ai/flows/generate-raffle-details';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Raffle, RaffleSlot, SlotStatus } from '@/lib/definitions';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, collection, writeBatch, runTransaction, query, where, getDocs } from 'firebase/firestore';

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

export async function signupAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = SignupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { message: 'La validación falló.', errors: validatedFields.error.flatten().fieldErrors };
  }
  const { email, password, name } = validatedFields.data;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), { 
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
  
  // La acción ahora solo valida. La autenticación real la hará el cliente.
  // Devolvemos los datos validados para que el cliente los use.
  return { message: 'Validación exitosa', success: true, data: { email, password } };
}

export async function logoutAction() {
  await auth.signOut();
  // Esperar un momento para que el contexto se actualice
  await new Promise(resolve => setTimeout(resolve, 500));
  redirect('/');
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
  ownerId: z.string().min(1, 'Se requiere el ID del propietario.'),
});

export async function createRaffleAction(formData: FormData) {
  const validatedFields = CreateRaffleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { message: 'La validación de los campos falló.' };

  const { ownerId, ...raffleData } = validatedFields.data;
  const newRaffleRef = doc(collection(db, 'raffles'));
  const raffleId = newRaffleRef.id;

  try {
    const newRaffle: Omit<Raffle, 'id'> = {
      ...raffleData,
      ownerId,
      status: 'active',
      winnerSlotNumber: null,
      createdAt: new Date().toISOString(),
      finalizedAt: null,
    };
    await setDoc(newRaffleRef, newRaffle);

    const batch = writeBatch(db);
    for (let i = 1; i <= 100; i++) {
      const slotRef = doc(db, 'raffles', raffleId, 'slots', String(i));
      batch.set(slotRef, { slotNumber: i, participantName: '', status: 'available' });
    }
    await batch.commit();
  } catch (error) {
    return { message: 'Error de base de datos: No se pudo crear la rifa.' };
  }

  revalidatePath('/dashboard');
  redirect(`/raffle/${raffleId}`);
}

const UpdateSlotSchema = z.object({
  raffleId: z.string(),
  slotNumber: z.coerce.number(),
  participantName: z.string(),
  status: z.enum(['available', 'reserved', 'paid']),
});

export async function updateSlotAction(formData: FormData) {
  const validatedFields = UpdateSlotSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { message: 'Datos de la casilla no válidos.' };

  const { raffleId, slotNumber, participantName, status } = validatedFields.data;
  const slotRef = doc(db, 'raffles', raffleId, 'slots', String(slotNumber));

  try {
    await updateDoc(slotRef, { participantName, status });
    return { message: 'Casilla actualizada con éxito.' };
  } catch (error) {
    return { message: 'Error de base de datos: No se pudo actualizar la casilla.' };
  }
}

export async function finalizeRaffleAction(raffleId: string) {
  if (!raffleId) throw new Error('Se requiere el ID de la rifa.');

  try {
    await runTransaction(db, async (transaction) => {
      const raffleRef = doc(db, 'raffles', raffleId);
      const raffleDoc = await transaction.get(raffleRef);

      if (!raffleDoc.exists() || raffleDoc.data().status !== 'active') {
        throw new Error("La rifa no existe o ya ha sido finalizada.");
      }

      const slotsRef = collection(db, 'raffles', raffleId, 'slots');
      const paidSlotsQuery = query(slotsRef, where('status', '==', 'paid'));
      const paidSlotsSnapshot = await getDocs(paidSlotsQuery);

      if (paidSlotsSnapshot.empty) {
        throw new Error("No hay casillas pagadas para seleccionar un ganador.");
      }

      const paidSlots = paidSlotsSnapshot.docs.map(doc => doc.data() as RaffleSlot);
      const winnerIndex = Math.floor(Math.random() * paidSlots.length);
      const winnerSlot = paidSlots[winnerIndex];

      transaction.update(raffleRef, {
        status: 'finalized',
        finalizedAt: new Date().toISOString(),
        winnerSlotNumber: winnerSlot.slotNumber,
      });
    });

    revalidatePath(`/raffle/${raffleId}`);
    return { message: '¡Rifa finalizada con éxito!' };

  } catch (error: any) {
    console.error('Error al finalizar la rifa:', error);
    return { message: error.message || 'Ocurrió un error al finalizar la rifa.' };
  }
}
