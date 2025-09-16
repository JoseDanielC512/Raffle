// use server'

/**
 * @fileOverview Generador de detalles de rifas impulsado por IA.
 *
 * - generateRaffleDetails - Una función que genera un nombre de rifa, descripción y términos basados en un prompt corto.
 * - GenerateRaffleDetailsInput - El tipo de entrada para la función generateRaffleDetails.
 * - GenerateRaffleDetailsOutput - El tipo de retorno para la función generateRaffleDetails.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRaffleDetailsInputSchema = z.object({
  prompt: z.string().describe('Un prompt corto que describe la rifa.'),
});
export type GenerateRaffleDetailsInput = z.infer<typeof GenerateRaffleDetailsInputSchema>;

const GenerateRaffleDetailsOutputSchema = z.object({
  name: z.string().describe('El nombre de la rifa generado.'),
  description: z.string().describe('La descripción de la rifa generada.'),
  terms: z.string().describe('Los términos y condiciones de la rifa generados.'),
});
export type GenerateRaffleDetailsOutput = z.infer<typeof GenerateRaffleDetailsOutputSchema>;

export async function generateRaffleDetails(input: GenerateRaffleDetailsInput): Promise<GenerateRaffleDetailsOutput> {
  return generateRaffleDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRaffleDetailsPrompt',
  input: {schema: GenerateRaffleDetailsInputSchema},
  output: {schema: GenerateRaffleDetailsOutputSchema},
  prompt: `Eres un asistente de IA que ayuda a los creadores de rifas a generar detalles atractivos para la rifa.

  Basado en el siguiente prompt, genera un nombre para la rifa, una descripción concisa y atractiva, y términos y condiciones claros y justos para la rifa.

  Prompt: {{{prompt}}}

  Nombre:
  Descripción:
  Términos y Condiciones: `,
});

const generateRaffleDetailsFlow = ai.defineFlow(
  {
    name: 'generateRaffleDetailsFlow',
    inputSchema: GenerateRaffleDetailsInputSchema,
    outputSchema: GenerateRaffleDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
