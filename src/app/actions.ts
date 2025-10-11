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
  console.log('🚀 [SERVER_ACTION] Iniciando generateDetailsAction');
  console.log('📋 [SERVER_ACTION] FormData recibido:', Object.fromEntries(formData.entries()));
  
  const validatedFields = GenerateDetailsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    console.error('❌ [SERVER_ACTION] Error de validación:', validatedFields.error.flatten());
    return { 
      message: 'La validación falló.', 
      errors: validatedFields.error.flatten().fieldErrors 
    };
  }

  const { prompt } = validatedFields.data;
  console.log('✅ [SERVER_ACTION] Validación exitosa');
  console.log('📝 [SERVER_ACTION] Prompt extraído:', prompt);
  
  try {
    console.log('🔄 [SERVER_ACTION] Importando flujo de generación de detalles...');
    const { generateRaffleDetails } = await import('@/ai/flows/generate-raffle-details');
    console.log('✅ [SERVER_ACTION] Flujo importado exitosamente');
    
    console.log('🤖 [SERVER_ACTION] Llamando al flujo de IA...');
    const startTime = Date.now();
    
    const result = await generateRaffleDetails({ prompt });
    
    const endTime = Date.now();
    console.log('⏱️ [SERVER_ACTION] Tiempo total del flujo:', `${endTime - startTime}ms`);
    console.log('✅ [SERVER_ACTION] Resultado recibido del flujo:', {
      hasName: !!result.name,
      hasDescription: !!result.description,
      hasTerms: !!result.terms,
      nameLength: result.name?.length || 0,
      descriptionLength: result.description?.length || 0,
      termsLength: result.terms?.length || 0
    });

    return {
      name: result.name,
      description: result.description,
      terms: result.terms,
      message: 'Contenido generado exitosamente con IA',
    };
  } catch (error) {
    console.error('💥 [SERVER_ACTION] Error en generateDetailsAction:', error);
    console.error('🔍 [SERVER_ACTION] Detalles completos del error:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : 'No stack disponible',
      name: error instanceof Error ? error.name : 'Error sin nombre',
      cause: error instanceof Error && error.cause ? error.cause : 'Sin causa',
      prompt: prompt
    });
    
    // Devuelve un mensaje de error genérico para el usuario.
    // Los detalles del error se registran en el servidor.
    return {
      message: 'No se pudo generar el contenido. Por favor, inténtalo de nuevo más tarde.',
      errors: undefined
    };
  }
}

// --- AI COMPLETE GENERATION (Details + Images) --- //

type GenerateCompleteState = {
  name?: string;
  description?: string;
  terms?: string;
  imageUrls?: string[];
  message?: string | null;
  errors?: Record<string, string[] | undefined> | undefined;
};

const GenerateCompleteSchema = z.object({
  prompt: z.string().min(1, 'La descripción del premio es obligatoria.'),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateCompleteAction(prevState: GenerateCompleteState, formData: FormData): Promise<GenerateCompleteState> {
  const validatedFields = GenerateCompleteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return {
      message: 'La validación falló.',
      errors: validatedFields.error.flatten().fieldErrors
    };
  }

  const { prompt } = validatedFields.data;

  try {
    // Llama al flujo completo de Genkit para generar detalles e imágenes.
    const { generateRaffleCompleteFlow } = await import('@/ai/flows/generate-raffle-images');
    const result = await generateRaffleCompleteFlow({ prompt });

    return {
      name: result.name,
      description: result.description,
      terms: result.terms,
      imageUrls: result.imageUrls,
      message: 'Contenido completo generado exitosamente con IA',
    };
  } catch (error) {
    console.error('[AI_COMPLETE_ACTION_ERROR]', error);
    // Devuelve un mensaje de error genérico para el usuario.
    return {
      message: 'No se pudo generar el contenido completo. Por favor, inténtalo de nuevo más tarde.',
      errors: undefined
    };
  }
}

// --- AI IMAGE GENERATION --- //

const GenerateImagesSchema = z.object({
  prompt: z.string().min(1, 'La descripción del premio es obligatoria.'),
  raffleName: z.string().optional(),
  idToken: z.string().min(1, 'Se requiere el token de autenticación.'),
});

export async function generateRaffleImagesAction(
  prompt: string,
  idToken: string,
  raffleName?: string
): Promise<{ urls?: string[]; error?: string }> {
  console.log('🚀 [SERVER_ACTION] Iniciando generateRaffleImagesAction');
  console.log('📝 [SERVER_ACTION] Prompt recibido:', prompt);
  console.log('🏷️ [SERVER_ACTION] Nombre de rifa recibido:', raffleName);
  console.log('🔐 [SERVER_ACTION] ID Token presente:', !!idToken);

  const validatedFields = GenerateImagesSchema.safeParse({ prompt, raffleName, idToken });

  if (!validatedFields.success) {
    console.error('❌ [SERVER_ACTION] Error de validación:', validatedFields.error);
    return { error: 'La validación de los campos falló.' };
  }

  let decodedToken;
  try {
    console.log('🔐 [SERVER_ACTION] Verificando token de autenticación...');
    const adminAuth = getAdminAuth();
    decodedToken = await adminAuth.verifyIdToken(idToken);
    console.log('✅ [SERVER_ACTION] Token verificado para usuario:', decodedToken.uid);
  } catch (error) {
    console.error('❌ [SERVER_ACTION] Error de autenticación:', error);
    return { error: 'Error de autenticación: El token no es válido.' };
  }

  try {
    console.log('🤖 [SERVER_ACTION] Llamando flujo de generación de imágenes...');
    const { generateRaffleImagesFlow } = await import('@/ai/flows/generate-raffle-images');
    const imageBase64Strings = await generateRaffleImagesFlow({
      description: prompt,
      raffleName: raffleName
    });

    console.log('📊 [SERVER_ACTION] Imágenes recibidas del flujo:', imageBase64Strings?.length || 0);
    console.log('🔍 [SERVER_ACTION] Tipo de imágenes:', Array.isArray(imageBase64Strings) ? 'array' : typeof imageBase64Strings);

    if (!imageBase64Strings || imageBase64Strings.length === 0) {
      console.error('❌ [SERVER_ACTION] No se recibieron imágenes del flujo');
      return { error: 'La IA no pudo generar imágenes basadas en la descripción.' };
    }

    // Filtrar URLs de fallback si existen
    const validBase64s = imageBase64Strings.filter(s => !s.startsWith('https'));
    console.log('🖼️ [SERVER_ACTION] Imágenes base64 válidas:', validBase64s.length);
    console.log('🔗 [SERVER_ACTION] URLs de fallback:', imageBase64Strings.length - validBase64s.length);

    if (validBase64s.length === 0) {
      console.log('🔄 [SERVER_ACTION] Solo URLs de fallback recibidas, devolviendo directamente');
      // Si solo hay URLs de fallback, devolverlas directamente
      return { urls: imageBase64Strings };
    }

    console.log('☁️ [SERVER_ACTION] Subiendo imágenes a Firebase Storage...');
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`;
    console.log('🪣 [SERVER_ACTION] Bucket name:', bucketName);

    const publicUrls: string[] = [];

    for (let i = 0; i < validBase64s.length; i++) {
      const base64String = validBase64s[i];
      console.log(`📤 [SERVER_ACTION] Subiendo imagen ${i + 1}/${validBase64s.length}`);

      try {
        const buffer = Buffer.from(base64String, 'base64');
        console.log('📊 [SERVER_ACTION] Buffer creado, tamaño:', buffer.length, 'bytes');

        const destinationPath = `generated/${decodedToken.uid}/${Date.now()}-${i}.png`;
        console.log('📁 [SERVER_ACTION] Destination path:', destinationPath);

        const publicUrl = await uploadBufferToStorage(buffer, destinationPath, 'image/png', bucketName);
        console.log('✅ [SERVER_ACTION] Imagen subida exitosamente:', publicUrl);
        publicUrls.push(publicUrl);
      } catch (uploadError) {
        console.error(`❌ [SERVER_ACTION] Error subiendo imagen ${i + 1}:`, uploadError);
        // Continuar con las demás imágenes
      }
    }

    console.log('🎉 [SERVER_ACTION] Proceso completado. URLs públicas generadas:', publicUrls.length);
    return { urls: publicUrls };

  } catch (error) {
    console.error('💥 [SERVER_ACTION] Error crítico en generateRaffleImagesAction:', error);
    console.error('🔍 [SERVER_ACTION] Detalles del error:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : 'No stack disponible',
      prompt,
      raffleName,
      hasIdToken: !!idToken
    });
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
  imageUrls: z.array(z.string()).optional(), // Acepta un array de URLs de imagen
});

export async function createRaffleAction(prevState: { message: string | null; success?: boolean }, formData: FormData): Promise<{ message: string | null; success?: boolean; raffleId?: string }> {
  const rawFormData = Object.fromEntries(formData.entries());
  
  // Extraer imageUrls del FormData
  const imageUrls = formData.getAll('imageUrls[]').map(String);

  const validatedFields = CreateRaffleSchema.safeParse({ ...rawFormData, imageUrls });

  if (!validatedFields.success) {
    console.error('[CREATE_RAFFLE_ACTION] ERROR: Validación de Zod fallida.', validatedFields.error.flatten());
    return { message: 'La validación de los campos falló.', success: false };
  }

  const { idToken, imageUrls: validatedImageUrls, ...raffleData } = validatedFields.data;

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

    const newRaffle: Omit<Raffle, 'id'> = {
      ...raffleData,
      ownerId,
      ownerName,
      status: 'active',
      winnerSlotNumber: null,
      createdAt: new Date().toISOString(),
      finalizedAt: null,
      finalizationDate: raffleData.finalizationDate || null,
      imageUrls: validatedImageUrls || [], // Añadir las URLs de las imágenes
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
