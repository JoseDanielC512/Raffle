import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash-lite',
});

// Exportar el modelo de imágenes por separado para mejor organización
export const imageModel = 'googleai/gemini-2.5-flash-image';
