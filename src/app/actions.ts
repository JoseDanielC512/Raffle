'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Raffle } from '@/lib/definitions';
import { auth } from '@/lib/firebase'; // Client auth for client-side actions if needed
import { getAdminAuth, getAdminDb, uploadBufferToStorage } from '@/lib/firebase-admin';
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

// Define the state type for generateDetailsAction
type GenerateDetailsState = {
  name?: string;
  description?: string;
  terms?: string;
  message?: string | null;
  errors?: Record<string, string[] | undefined> | undefined;
};

// Define the schema for AI generation input
const GenerateDetailsSchema = z.object({
  prompt: z.string().min(1, 'La descripción del premio es obligatoria.'),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateDetailsAction(prevState: GenerateDetailsState, formData: FormData): Promise<GenerateDetailsState> {
  const validatedFields = GenerateDetailsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { 
      message: 'La validación falló.', 
      errors: validatedFields.error.flatten().fieldErrors 
    };
  }

  const { prompt } = validatedFields.data;
  
  try {
    // Llama al flujo real de Genkit para generar el contenido.
    const { generateRaffleDetails } = await import('@/ai/flows/generate-raffle-details');
    const result = await generateRaffleDetails({ prompt });

    return {
      name: result.name,
      description: result.description,
      terms: result.terms,
      message: 'Contenido generado exitosamente con IA',
    };
  } catch (error) {
    console.error('[AI_ACTION_ERROR]', error);
    // Devuelve un mensaje de error genérico para el usuario.
    // Los detalles del error se registran en el servidor.
    return { 
      message: 'No se pudo generar el contenido. Por favor, inténtalo de nuevo más tarde.',
      errors: undefined
    };
  }
}

// --- AI IMAGE GENERATION --- //

const GenerateImagesSchema = z.object({
  prompt: z.string().min(1, 'La descripción del premio es obligatoria.'),
  idToken: z.string().min(1, 'Se requiere el token de autenticación.'),
});

export async function generateRaffleImagesAction(prompt: string, idToken: string): Promise<{ urls?: string[]; error?: string }> {
  const validatedFields = GenerateImagesSchema.safeParse({ prompt, idToken });

  if (!validatedFields.success) {
    return { error: 'La validación de los campos falló.' };
  }

  try {
    const adminAuth = getAdminAuth();
    await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    return { error: 'Error de autenticación: El token no es válido.' };
  }

  try {
    const { generateRaffleImagesFlow } = await import('@/ai/flows/generate-raffle-images');
    const imageUrls = await generateRaffleImagesFlow({ description: prompt });
    return { urls: imageUrls };
  } catch (error) {
    console.error('[AI_IMAGE_ACTION_ERROR]', error);
    return { error: 'No se pudieron generar las imágenes. Por favor, inténtalo de nuevo.' };
  }
}


// --- RAFFLE ACTIONS --- //

const CreateRaffleSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  description: z.string().min(1, 'La descripción es obligatoria.'),
  terms: z.string().min(1, 'Los términos son obligatorios.'),
  slotPrice: z.coerce.number().min(1, 'El precio de la casilla es obligatorio y debe ser mayor a 0.'),
  finalizationDate: z.string().nullable().optional(), // Fecha de finalización en formato ISO string
  idToken: z.string().min(1, 'Se requiere el token de autenticación.'),
  images: z.array(z.instanceof(File)).optional(), // Acepta un array de archivos
});

export async function createRaffleAction(prevState: { message: string | null; success?: boolean }, formData: FormData): Promise<{ message: string | null; success?: boolean; raffleId?: string }> {
  const rawFormData = Object.fromEntries(formData.entries());
  const images = formData.getAll('images').filter(img => img instanceof File && img.size > 0) as File[];
  
  const validatedFields = CreateRaffleSchema.safeParse({ ...rawFormData, images });

  if (!validatedFields.success) {
    console.error('[CREATE_RAFFLE_ACTION] ERROR: Validación de Zod fallida.', validatedFields.error.flatten());
    return { message: 'La validación de los campos falló.', success: false };
  }

  const { idToken, images: imageFiles, ...raffleData } = validatedFields.data;

  let ownerId: string;
  let ownerName: string;
  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    ownerId = decodedToken.uid;
    const userRecord = await adminAuth.getUser(ownerId);
    ownerName = userRecord.displayName || 'Usuario Anónimo';
  } catch (error) {
    console.error('[CREATE_RAFFLE_ACTION] ERROR: Falló la verificación del idToken.', error);
    return { message: 'Error de autenticación: El token no es válido.', success: false };
  }

  try {
    const activeRaffleCount = await countActiveRafflesForUserAdmin(ownerId);
    if (activeRaffleCount >= 2) {
      throw new Error('Has alcanzado el límite de 2 rifas activas.');
    }

    const adminDb = getAdminDb();
    const newRaffleRef = adminDb.collection('raffles').doc();
    const raffleId = newRaffleRef.id;

    // Subir imágenes a Firebase Storage
    const imageUrls: string[] = [];
    if (imageFiles && imageFiles.length > 0) {
      // Obtener el nombre del bucket desde variables de entorno existentes
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`;
      console.log(`[CREATE_RAFFLE_ACTION] Using bucket: ${bucketName}`);
      
      for (const file of imageFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const destinationPath = `raffles/${raffleId}/${Date.now()}-${file.name}`;
        const publicUrl = await uploadBufferToStorage(buffer, destinationPath, file.type, bucketName);
        imageUrls.push(publicUrl);
      }
    }

    const newRaffle: Omit<Raffle, 'id'> = {
      ...raffleData,
      ownerId,
      ownerName,
      status: 'active',
      winnerSlotNumber: null,
      createdAt: new Date().toISOString(),
      finalizedAt: null,
      finalizationDate: raffleData.finalizationDate || null,
      imageUrls, // Añadir las URLs de las imágenes
      activityHistory: [{
        id: `act-${Date.now()}`,
        action: 'raffle_created',
        timestamp: new Date().toISOString(),
        userId: ownerId,
        details: { message: 'Rifa creada exitosamente' }
      }]
    };

    await newRaffleRef.set(newRaffle);

    const batch = adminDb.batch();
    for (let i = 0; i < 100; i++) {
      const slotRef = adminDb.collection('raffles').doc(raffleId).collection('slots').doc(String(i));
      batch.set(slotRef, { slotNumber: i, participantName: '', status: 'available' });
    }
    await batch.commit();

    revalidatePath('/dashboard', 'page');
    revalidatePath('/', 'layout');

    return { 
      message: 'Rifa creada exitosamente!', 
      success: true, 
      raffleId: raffleId 
    };
  } catch (error) {
    console.error('[CREATE_RAFFLE_ACTION] ERROR GENERAL:', error);
    return { 
      message: error instanceof Error ? error.message : 'Error de base de datos: No se pudo crear la rifa.', 
      success: false 
    };
  }
}

// ... (other actions remain unchanged for now, but would need similar admin SDK treatment if used from server)

const UpdateSlotSchema = z.object({
  raffleId: z.string(),
  slotNumber: z.coerce.number().int().min(0).max(99, 'El número de casilla debe estar entre 0 y 99.'),
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

    // Get current slot data to determine previous status
    const slotRef = adminDb.collection('raffles').doc(raffleId).collection('slots').doc(String(slotNumber));
    const slotDoc = await slotRef.get();
    const previousStatus = slotDoc.exists ? slotDoc.data()?.status : 'available';

    await slotRef.update({ 
      participantName: participantName || null,
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Add activity log
    const activityId = `act-${Date.now()}`;
    const activityRef = adminDb.collection('raffles').doc(raffleId).collection('activity').doc(activityId);
    await activityRef.set({
      id: activityId,
      action: 'slot_updated',
      timestamp: new Date().toISOString(),
      userId: ownerId,
      details: {
        slotNumber: slotNumber,
        previousStatus: previousStatus,
        newStatus: status,
        message: `Casilla ${slotNumber} actualizada de ${previousStatus} a ${status}`
      }
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
  winnerSlotNumber: z.coerce.number().int().min(0).max(99, 'El número de casilla debe estar entre 0 y 99.'),
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

    // Update the raffle document
    await raffleRef.update({
      status: 'finalized',
      winnerSlotNumber: winnerSlotNumber,
      finalizedAt: new Date().toISOString(),
    });

    // Add activity log for raffle finalization
    const activityId = `act-${Date.now()}`;
    const activityRef = adminDb.collection('raffles').doc(raffleId).collection('activity').doc(activityId);
    await activityRef.set({
      id: activityId,
      action: 'raffle_finalized',
      timestamp: new Date().toISOString(),
      userId: ownerId,
      details: {
        winnerSlotNumber: winnerSlotNumber,
        message: `Rifa finalizada. Casilla ganadora: ${winnerSlotNumber}`
      }
    });

    revalidatePath(`/raffle/${raffleId}`);
    revalidatePath('/dashboard');
    return { message: '¡Rifa finalizada y ganador declarado!', success: true };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { message: `Error de base de datos: ${errorMessage}`, success: false };
  }
}
