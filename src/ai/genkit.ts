import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';

export const textModel = 'gemini-2.5-flash-lite';
export const imageModel = 'imagen-4.0-generate-001';

console.log('🔧 [GENKIT_INIT] Inicializando Genkit con configuración híbrida...');
console.log('🤖 [GENKIT_INIT] Modelo de texto configurado:', textModel);
console.log('🖼️ [GENKIT_INIT] Modelo de imagen configurado:', imageModel);
console.log('🌍 [GENKIT_INIT] Región configurada:', process.env.GOOGLE_CLOUD_REGION || 'us-central1');
console.log('🔑 [GENKIT_INIT] API Key de Google AI presente:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

let aiInstance: any;

try {
  // Inicializar solo con Google AI para evitar problemas con Vertex AI
  aiInstance = genkit({
    plugins: [
      googleAI({
        apiKey: process.env.GOOGLE_API_KEY,
      }), // Para generación de texto
    ],
  });
  
  console.log('✅ [GENKIT_INIT] Genkit inicializado exitosamente con Google AI');
  console.log('🔍 [GENKIT_INIT] Plugin Google AI registrado para texto con API Key');
  console.log('🔍 [GENKIT_INIT] Vertex AI se agregará dinámicamente para imágenes');
} catch (error) {
  console.error('❌ [GENKIT_INIT] Error inicializando Genkit:', error);
  console.error('🔍 [GENKIT_INIT] Detalles del error:', {
    message: error instanceof Error ? error.message : 'Error desconocido',
    stack: error instanceof Error ? error.stack : 'No stack disponible'
  });
  throw error;
}

export const ai = aiInstance;
