// use server'

/**
 * @fileOverview AI-powered raffle detail generator.
 *
 * - generateRaffleDetails - A function that generates a raffle name, description, and terms based on a short prompt.
 * - GenerateRaffleDetailsInput - The input type for the generateRaffleDetails function.
 * - GenerateRaffleDetailsOutput - The return type for the generateRaffleDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRaffleDetailsInputSchema = z.object({
  prompt: z.string().describe('A short prompt describing the raffle.'),
});
export type GenerateRaffleDetailsInput = z.infer<typeof GenerateRaffleDetailsInputSchema>;

const GenerateRaffleDetailsOutputSchema = z.object({
  name: z.string().describe('The generated raffle name.'),
  description: z.string().describe('The generated raffle description.'),
  terms: z.string().describe('The generated raffle terms and conditions.'),
});
export type GenerateRaffleDetailsOutput = z.infer<typeof GenerateRaffleDetailsOutputSchema>;

export async function generateRaffleDetails(input: GenerateRaffleDetailsInput): Promise<GenerateRaffleDetailsOutput> {
  return generateRaffleDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRaffleDetailsPrompt',
  input: {schema: GenerateRaffleDetailsInputSchema},
  output: {schema: GenerateRaffleDetailsOutputSchema},
  prompt: `You are an AI assistant that helps raffle creators generate compelling raffle details.

  Based on the following prompt, generate a raffle name, a concise and engaging description, and clear and fair terms and conditions for the raffle.

  Prompt: {{{prompt}}}

  Name:
  Description:
  Terms and Conditions: `,
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
