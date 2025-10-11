import { ai, textModel } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const GenerateRaffleDetailsSchema = z.object({
  name: z.string().describe('El nombre de la rifa generado.'),
  description: z.string().describe('La descripción de la rifa generada.'),
  terms: z.string().describe('Los términos y condiciones de la rifa generados.'),
});

export const generateRaffleDetails = ai.defineFlow(
  {
    name: 'generateRaffleDetails',
    inputSchema: z.object({ prompt: z.string() }),
    outputSchema: GenerateRaffleDetailsSchema,
  },
  async ({ prompt }: { prompt: string }) => {
    console.log('🚀 [GENERATE_RAFFLE_DETAILS] Iniciando generación de detalles');
    console.log('📝 [GENERATE_RAFFLE_DETAILS] Prompt recibido:', prompt);
    console.log('🤖 [GENERATE_RAFFLE_DETAILS] Modelo de texto:', textModel);
    console.log('🔍 [GENERATE_RAFFLE_DETAILS] Verificando disponibilidad del modelo...');
    
    try {
      // Verificar que el modelo esté disponible
      const model = googleAI.model(textModel);
      console.log('✅ [GENERATE_RAFFLE_DETAILS] Modelo Google AI creado exitosamente:', textModel);
      console.log('🔍 [GENERATE_RAFFLE_DETAILS] Tipo de modelo:', typeof model);
    } catch (modelError) {
      console.error('❌ [GENERATE_RAFFLE_DETAILS] Error creando el modelo Google AI:', modelError);
      console.error('🔍 [GENERATE_RAFFLE_DETAILS] Detalles del error del modelo:', {
        message: modelError instanceof Error ? modelError.message : 'Error desconocido',
        stack: modelError instanceof Error ? modelError.stack : 'No stack disponible'
      });
      throw modelError;
    }

    const detailsPrompt = `Eres un asistente de IA que ayuda a los creadores de rifas a generar detalles atractivos para la rifa.

    Basado en el siguiente prompt, genera un nombre para la rifa, una descripción concisa y atractiva, y términos y condiciones claros y justos para la rifa.

    Prompt: ${prompt}

    Responde con un objeto JSON que tenga las siguientes propiedades:
    - name: El nombre de la rifa (string)
    - description: La descripción de la rifa (string)
    - terms: Los términos y condiciones (string)`;

    console.log('📤 [GENERATE_RAFFLE_DETAILS] Prompt enviado:', detailsPrompt);
    console.log('🔍 [GENERATE_RAFFLE_DETAILS] Preparando llamada al modelo...');
    console.log('🎛️ [GENERATE_RAFFLE_DETAILS] Configuración del modelo:', {
      model: textModel,
      temperature: 0.8,
      promptLength: detailsPrompt.length
    });

    let llmResponse;
    try {
      console.log('📞 [GENERATE_RAFFLE_DETAILS] Realizando llamada a ai.generate()...');
      const startTime = Date.now();
      
      llmResponse = await ai.generate({
        model: googleAI.model(textModel),
        prompt: detailsPrompt,
        config: {
          temperature: 0.8,
        },
      });
      
      const endTime = Date.now();
      console.log('⏱️ [GENERATE_RAFFLE_DETAILS] Tiempo de respuesta:', `${endTime - startTime}ms`);
      console.log('✅ [GENERATE_RAFFLE_DETAILS] Respuesta de IA recibida exitosamente');
      console.log('🔍 [GENERATE_RAFFLE_DETAILS] Tipo de respuesta:', typeof llmResponse);
      console.log('🏗️ [GENERATE_RAFFLE_DETAILS] Estructura de respuesta:', Object.getOwnPropertyNames(llmResponse));
      console.log('📊 [GENERATE_RAFFLE_DETAILS] Propiedades de respuesta:', {
        hasText: 'text' in llmResponse,
        hasMessage: 'message' in llmResponse,
        hasCandidates: 'candidates' in llmResponse,
        textLength: llmResponse.text?.length || 0
      });
    } catch (generateError) {
      console.error('❌ [GENERATE_RAFFLE_DETAILS] Error en ai.generate():', generateError);
      console.error('🔍 [GENERATE_RAFFLE_DETAILS] Detalles del error de generación:', {
        message: generateError instanceof Error ? generateError.message : 'Error desconocido',
        stack: generateError instanceof Error ? generateError.stack : 'No stack disponible',
        name: generateError instanceof Error ? generateError.name : 'Error sin nombre',
        cause: generateError instanceof Error && generateError.cause ? generateError.cause : 'Sin causa'
      });
      throw generateError;
    }

    const rawText = llmResponse.text;
    console.log('📄 [GENERATE_RAFFLE_DETAILS] Respuesta raw:', rawText);
    console.log('📏 [GENERATE_RAFFLE_DETAILS] Longitud de respuesta:', rawText.length);

    // Limpiar el texto para extraer solo el JSON válido
    let cleanedJson = rawText.trim();
    console.log('🧹 [GENERATE_RAFFLE_DETAILS] JSON sin limpiar:', cleanedJson);

    // Remover bloques de código markdown si existen
    const originalCleaned = cleanedJson;
    cleanedJson = cleanedJson.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    cleanedJson = cleanedJson.replace(/```\s*/g, '');

    if (cleanedJson !== originalCleaned) {
      console.log('🔧 [GENERATE_RAFFLE_DETAILS] Markdown removido de la respuesta');
    }

    console.log('🧹 [GENERATE_RAFFLE_DETAILS] JSON limpiado:', cleanedJson);

    // Intentar parsear como JSON
    let parsed;
    try {
      parsed = JSON.parse(cleanedJson);
      console.log('✅ [GENERATE_RAFFLE_DETAILS] JSON parseado exitosamente:', parsed);
    } catch (parseError) {
      console.error('❌ [GENERATE_RAFFLE_DETAILS] Error parseando JSON:', parseError);
      console.error('📄 [GENERATE_RAFFLE_DETAILS] Raw response:', rawText);
      console.error('🧹 [GENERATE_RAFFLE_DETAILS] Cleaned JSON:', cleanedJson);
      console.error('🔍 [GENERATE_RAFFLE_DETAILS] Error details:', {
        message: parseError instanceof Error ? parseError.message : 'Error desconocido',
        position: parseError instanceof Error && 'position' in parseError ? (parseError as any).position : 'N/A'
      });
      throw new Error('La respuesta de la IA no tiene el formato JSON esperado');
    }

    // Validar contra el esquema de Zod
    try {
      const validatedResult = GenerateRaffleDetailsSchema.parse(parsed);
      console.log('✅ [GENERATE_RAFFLE_DETAILS] Validación Zod exitosa');
      console.log('🎯 [GENERATE_RAFFLE_DETAILS] Resultado final:', {
        name: validatedResult.name,
        descriptionLength: validatedResult.description.length,
        termsLength: validatedResult.terms.length
      });

      return validatedResult;
    } catch (validationError) {
      console.error('❌ [GENERATE_RAFFLE_DETAILS] Error de validación Zod:', validationError);
      console.error('📦 [GENERATE_RAFFLE_DETAILS] Datos a validar:', parsed);
      throw validationError;
    }
  }
);
