import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';
import { ai, imageModel, textModel } from '../genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import parseDataURL from 'data-urls';

export const generateRaffleImagesFlow = defineFlow(
  ai.registry,
  {
    name: 'generateRaffleImagesFlow',
    inputSchema: z.object({
      description: z.string(),
      raffleName: z.string().optional()
    }),
    outputSchema: z.array(z.string()),
  },
  async (input: { description: string; raffleName?: string }) => {
    const { description, raffleName } = input;

    console.log('🚀 [GENERATE_RAFFLE_IMAGES] Iniciando generación de imágenes');
    console.log('📝 [GENERATE_RAFFLE_IMAGES] Descripción:', description);
    console.log('🏷️ [GENERATE_RAFFLE_IMAGES] Nombre de rifa:', raffleName);
    console.log('🤖 [GENERATE_RAFFLE_IMAGES] Modelo de imagen:', imageModel);

    try {
      // Crear contexto para el prompt basado en si tenemos nombre de rifa o no
      const raffleContext = raffleName
        ? `for "${raffleName}" raffle. The raffle prize is: "${description}"`
        : `prize: "${description}"`;

      const prompt = `Create 3 high-quality, photorealistic images for a raffle ${raffleContext}.

      Requirements:
      - Images should be visually appealing and professional
      - Good lighting and composition
      - Showcase the prize in an attractive setting
      - NO text, watermarks, or branding
      - Clean, commercial-quality product photography style
      - Each image should show a different angle/perspective
      ${raffleName ? `- Consider the raffle theme "${raffleName}" in the styling and presentation` : ''}

      Generate exactly 3 distinct images following these specifications.`;

      console.log('📤 [GENERATE_RAFFLE_IMAGES] Prompt enviado:', prompt);

      // Generar imágenes reales con modelo Imagen
      const generationResult = await ai.generate({
        model: vertexAI.model(imageModel),
        prompt,
        config: {
          candidateCount: 3, // Generar 3 imágenes
          aspectRatio: '1:1',
        },
        output: {
          format: 'media' // Especificar formato de medios para imágenes
        },
      });

      console.log('✅ [GENERATE_RAFFLE_IMAGES] Respuesta de IA recibida');
      console.log('🔍 [GENERATE_RAFFLE_IMAGES] Tipo de respuesta:', typeof generationResult);
      console.log('🏗️ [GENERATE_RAFFLE_IMAGES] Propiedades de respuesta:', Object.getOwnPropertyNames(generationResult));

      const imageBase64Strings: string[] = [];

      // Procesar las imágenes generadas desde la respuesta de Genkit
      console.log('🔄 [GENERATE_RAFFLE_IMAGES] Procesando respuesta de Imagen...');

      // Para modelos Imagen, las imágenes están en response.message.content
      console.log('📦 [GENERATE_RAFFLE_IMAGES] Message content:', generationResult.message?.content);

      if (generationResult.message?.content && Array.isArray(generationResult.message.content)) {
        console.log('🎯 [GENERATE_RAFFLE_IMAGES] Content array encontrado con', generationResult.message.content.length, 'elementos');

        for (let i = 0; i < generationResult.message.content.length; i++) {
          const contentItem = generationResult.message.content[i];
          console.log(`🖼️ [GENERATE_RAFFLE_IMAGES] Procesando contenido ${i + 1}:`, contentItem);

          if (contentItem && typeof contentItem === 'object' && 'media' in contentItem) {
            const mediaItem = contentItem.media;
            console.log('🎨 [GENERATE_RAFFLE_IMAGES] Media item encontrado:', mediaItem);

            if (mediaItem && typeof mediaItem === 'object' && 'url' in mediaItem) {
              const dataUrl = mediaItem.url;
              console.log('🔗 [GENERATE_RAFFLE_IMAGES] Data URL encontrada:', dataUrl?.substring(0, 50) + '...');

              if (dataUrl && typeof dataUrl === 'string') {
                try {
                  // Usar data-urls para parsear correctamente
                  const parsed = parseDataURL(dataUrl);

                  if (parsed && parsed.body) {
                    console.log('✅ [GENERATE_RAFFLE_IMAGES] Data URL parseada correctamente');
                    console.log('📊 [GENERATE_RAFFLE_IMAGES] MIME type:', parsed.mimeType?.toString());
                    console.log('📊 [GENERATE_RAFFLE_IMAGES] Tamaño del buffer:', parsed.body.length);

                    if (parsed.body.length > 0) {
                      // Convertir ArrayBuffer a base64 si es necesario
                      const base64String = typeof parsed.body === 'string'
                        ? parsed.body
                        : Buffer.from(parsed.body).toString('base64');

                      console.log('💾 [GENERATE_RAFFLE_IMAGES] Imagen base64 agregada, tamaño:', base64String.length);
                      imageBase64Strings.push(base64String);
                    } else {
                      console.warn('⚠️ [GENERATE_RAFFLE_IMAGES] Buffer vacío');
                    }
                  } else {
                    console.warn('⚠️ [GENERATE_RAFFLE_IMAGES] No se pudo parsear la Data URL');
                  }
                } catch (parseError) {
                  console.error('❌ [GENERATE_RAFFLE_IMAGES] Error parseando Data URL:', parseError);
                  console.error('🔗 [GENERATE_RAFFLE_IMAGES] Data URL problemática:', dataUrl);
                }
              } else {
                console.warn('⚠️ [GENERATE_RAFFLE_IMAGES] Data URL inválida o no es string');
              }
            } else {
              console.warn('⚠️ [GENERATE_RAFFLE_IMAGES] No se encontró media.url en el contenido');
            }
          } else {
            console.warn('⚠️ [GENERATE_RAFFLE_IMAGES] Contenido no tiene estructura media esperada');
          }
        }
      } else {
        console.warn('⚠️ [GENERATE_RAFFLE_IMAGES] No se encontró content array en la respuesta');
        console.log('🏗️ [GENERATE_RAFFLE_IMAGES] Estructura completa de respuesta:', JSON.stringify(generationResult, null, 2));
      }

      console.log('📊 [GENERATE_RAFFLE_IMAGES] Imágenes generadas:', imageBase64Strings.length);

      // Si no se generaron imágenes, fallback a placeholders
      if (imageBase64Strings.length === 0) {
        console.warn('🚨 [GENERATE_RAFFLE_IMAGES] No se pudieron generar imágenes reales, usando placeholders temporales');
        // Usar nombre de rifa en el seed si está disponible, sino usar descripción
        const seedBase = raffleName
          ? raffleName.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20)
          : description.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);

        console.log('🔄 [GENERATE_RAFFLE_IMAGES] Generando placeholders con seed:', seedBase);

        const fallbackUrls = [
          `https://picsum.photos/seed/${seedBase}-1/800/600.jpg`,
          `https://picsum.photos/seed/${seedBase}-2/800/600.jpg`,
          `https://picsum.photos/seed/${seedBase}-3/800/600.jpg`,
        ];
        console.log('✅ [GENERATE_RAFFLE_IMAGES] Placeholders generados:', fallbackUrls);
        return fallbackUrls;
      }

      if (imageBase64Strings.length === 0) {
        console.error('💥 [GENERATE_RAFFLE_IMAGES] Error crítico: no se pudieron generar imágenes');
        throw new Error("No se pudieron generar imágenes ni usar fallback.");
      }

      console.log('🎉 [GENERATE_RAFFLE_IMAGES] Proceso completado exitosamente con', imageBase64Strings.length, 'imágenes');
      return imageBase64Strings;

    } catch (error) {
      console.error('💥 [GENERATE_RAFFLE_IMAGES] Error crítico en flujo de imágenes:', error);
      console.error('🔍 [GENERATE_RAFFLE_IMAGES] Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : 'No stack disponible',
        input: { description, raffleName }
      });

      const fallbackUrls = [
        'https://picsum.photos/seed/error-raffle-1/800/600.jpg',
        'https://picsum.photos/seed/error-raffle-2/800/600.jpg',
        'https://picsum.photos/seed/error-raffle-3/800/600.jpg',
      ];

      console.log('🔄 [GENERATE_RAFFLE_IMAGES] Usando URLs de emergencia:', fallbackUrls);
      return fallbackUrls.slice(0, 3);
    }
  }
);

// Función combinada que genera detalles e imágenes de la rifa
export const generateRaffleCompleteFlow = defineFlow(
  ai.registry,
  {
    name: 'generateRaffleCompleteFlow',
    inputSchema: z.object({
      prompt: z.string()
    }),
    outputSchema: z.object({
      name: z.string(),
      description: z.string(),
      terms: z.string(),
      imageUrls: z.array(z.string())
    }),
  },
  async (input: { prompt: string }) => {
    const { prompt } = input;

    console.log('🚀 [GENERATE_RAFFLE_COMPLETE] Iniciando generación completa');
    console.log('📝 [GENERATE_RAFFLE_COMPLETE] Prompt recibido:', prompt);

    try {
      // Primero generar los detalles de la rifa
      console.log('📝 [GENERATE_RAFFLE_COMPLETE] Generando detalles de la rifa...');

      const detailsPrompt = `Eres un asistente de IA que ayuda a los creadores de rifas a generar detalles atractivos para la rifa.

      Basado en el siguiente prompt, genera un nombre para la rifa, una descripción concisa y atractiva, y términos y condiciones claros y justos para la rifa.

      Prompt: ${prompt}

      Responde con un objeto JSON que tenga las propiedades: name (nombre de la rifa), description (descripción atractiva), y terms (términos y condiciones).`;

      console.log('📤 [GENERATE_RAFFLE_COMPLETE] Prompt de detalles enviado:', detailsPrompt);

      const detailsResult = await ai.generate({
        model: vertexAI.model(textModel),
        prompt: detailsPrompt,
        config: {
          temperature: 0.8,
        },
      });

      console.log('✅ [GENERATE_RAFFLE_COMPLETE] Respuesta de detalles recibida');
      const rawText = detailsResult.text;
      console.log('📄 [GENERATE_RAFFLE_COMPLETE] Respuesta raw:', rawText);

      // Limpiar el texto para extraer solo el JSON válido
      let cleanedJson = rawText.trim();
      console.log('🧹 [GENERATE_RAFFLE_COMPLETE] JSON sin limpiar:', cleanedJson);

      // Remover bloques de código markdown si existen
      cleanedJson = cleanedJson.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      cleanedJson = cleanedJson.replace(/```\s*/g, '');
      console.log('🧹 [GENERATE_RAFFLE_COMPLETE] JSON limpiado:', cleanedJson);

      // Intentar parsear como JSON
      let raffleDetails;
      try {
        raffleDetails = JSON.parse(cleanedJson);
        console.log('✅ [GENERATE_RAFFLE_COMPLETE] JSON parseado exitosamente:', raffleDetails);
      } catch (parseError) {
        console.error('❌ [GENERATE_RAFFLE_COMPLETE] Error parseando JSON:', parseError);
        console.error('📄 [GENERATE_RAFFLE_COMPLETE] Raw response:', rawText);
        console.error('🧹 [GENERATE_RAFFLE_COMPLETE] Cleaned JSON:', cleanedJson);
        throw new Error('La respuesta de la IA no tiene el formato JSON esperado');
      }

      // Luego generar imágenes usando el nombre y descripción generados
      const raffleName = raffleDetails.name;
      const raffleDescription = raffleDetails.description;

      console.log('🖼️ [GENERATE_RAFFLE_COMPLETE] Generando imágenes para:', raffleName);
      console.log('📝 [GENERATE_RAFFLE_COMPLETE] Descripción de imagen:', raffleDescription);

      const imagesResult = await generateRaffleImagesFlow({
        description: raffleDescription,
        raffleName: raffleName
      });

      console.log('✅ [GENERATE_RAFFLE_COMPLETE] Imágenes generadas:', imagesResult.length);

      const result = {
        name: raffleName,
        description: raffleDescription,
        terms: raffleDetails.terms,
        imageUrls: imagesResult
      };

      console.log('🎉 [GENERATE_RAFFLE_COMPLETE] Proceso completo exitoso:', result);
      return result;

    } catch (error) {
      console.error('💥 [GENERATE_RAFFLE_COMPLETE] Error crítico en flujo completo:', error);
      console.error('🔍 [GENERATE_RAFFLE_COMPLETE] Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : 'No stack disponible',
        input: { prompt }
      });

      // Fallback con valores por defecto
      const fallbackResult = {
        name: 'Rifa Especial',
        description: 'Una rifa increíble con premios únicos',
        terms: 'Términos y condiciones estándar aplican.',
        imageUrls: [
          'https://picsum.photos/seed/fallback-raffle-1/800/600.jpg',
          'https://picsum.photos/seed/fallback-raffle-2/800/600.jpg',
          'https://picsum.photos/seed/fallback-raffle-3/800/600.jpg',
        ]
      };

      console.log('🔄 [GENERATE_RAFFLE_COMPLETE] Usando resultado de emergencia:', fallbackResult);
      return fallbackResult;
    }
  }
);
