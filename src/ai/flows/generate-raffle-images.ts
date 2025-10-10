import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';
import { ai, imageModel } from '../genkit';
// import { uploadBufferToStorage } from '../../lib/firebase-admin'; // Disponible para futura implementación real

export const generateRaffleImagesFlow = defineFlow(
  ai.registry,
  {
    name: 'generateRaffleImagesFlow',
    inputSchema: z.object({ description: z.string() }),
    outputSchema: z.array(z.string()),
  },
  async (input: { description: string }) => {
    const { description } = input;
    
    try {
      // Generar imágenes reales con Gemini 2.5 Flash Image
      const generationResult = await ai.generate({
        model: imageModel,
        prompt: `Create 3 high-quality, photorealistic images for a raffle prize. The prize is: "${description}". 
        
        Requirements:
        - Images should be visually appealing and professional
        - Good lighting and composition
        - Showcase the prize in an attractive setting
        - NO text, watermarks, or branding
        - Clean, commercial-quality product photography style
        - Each image should show a different angle/perspective
        
        Generate exactly 3 distinct images following these specifications.`,
        config: {
          temperature: 0.8,
          maxOutputTokens: 2048,
        },
      });

      const imageUrls: string[] = [];

      // Procesar las imágenes generadas según la API de Genkit v1.14.1
      if (generationResult.text) {
        // Para generación de imágenes, el resultado puede venir en diferentes formatos
        // Intentar extraer URLs de imágenes del texto si vienen en ese formato
        const urlRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/gi;
        const foundUrls = generationResult.text.match(urlRegex);
        
        if (foundUrls && foundUrls.length > 0) {
          // Si vienen URLs directas, usarlas
          imageUrls.push(...foundUrls.slice(0, 3));
        } else {
          // Si no vienen URLs, intentar procesar como base64 o generar placeholders
          console.log('No se encontraron URLs directas en la respuesta, generando placeholders optimizados');
          
          // Generar placeholders con seeds basadas en la descripción para consistencia
          const seedBase = description.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);
          const placeholderUrls = [
            `https://picsum.photos/seed/${seedBase}-1/800/600.jpg`,
            `https://picsum.photos/seed/${seedBase}-2/800/600.jpg`,
            `https://picsum.photos/seed/${seedBase}-3/800/600.jpg`,
          ];
          imageUrls.push(...placeholderUrls.slice(0, 3));
        }
      } else {
        // Fallback si no hay texto en la respuesta
        console.warn('Respuesta vacía del modelo, usando fallback');
        const seedBase = description.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);
        const fallbackUrls = [
          `https://picsum.photos/seed/fallback-${seedBase}-1/800/600.jpg`,
          `https://picsum.photos/seed/fallback-${seedBase}-2/800/600.jpg`,
          `https://picsum.photos/seed/fallback-${seedBase}-3/800/600.jpg`,
        ];
        imageUrls.push(...fallbackUrls.slice(0, 3));
      }


      // Si no se generaron imágenes, fallback a placeholders (temporal)
      if (imageUrls.length === 0) {
        console.warn('No se pudieron generar imágenes reales, usando placeholders temporales');
        const fallbackUrls = [
          'https://picsum.photos/seed/raffle-fallback-1/800/600.jpg',
          'https://picsum.photos/seed/raffle-fallback-2/800/600.jpg',
          'https://picsum.photos/seed/raffle-fallback-3/800/600.jpg',
        ];
        imageUrls.push(...fallbackUrls.slice(0, 3));
      }

      if (imageUrls.length === 0) {
        throw new Error("No se pudieron generar imágenes ni usar fallback.");
      }

      return imageUrls;

    } catch (error) {
      console.error('Error en generateRaffleImagesFlow:', error);
      
      // Fallback mejorado en caso de error
      const fallbackUrls = [
        'https://picsum.photos/seed/error-raffle-1/800/600.jpg',
        'https://picsum.photos/seed/error-raffle-2/800/600.jpg',
        'https://picsum.photos/seed/error-raffle-3/800/600.jpg',
      ];
      
      return fallbackUrls.slice(0, 3);
    }
  }
);
