/**
 * Utilidades para manejar la transferencia de datos entre páginas del asistente IA
 * y el formulario de creación de rifa
 */

// Keys para session storage
const AI_DATA_KEY = 'raffle-ai-generated-data';
const AI_PROMPT_KEY = 'raffle-ai-prompt';

// Tipos de datos
export interface AIGeneratedData {
  name?: string;
  description?: string;
  terms?: string;
  generatedAt: number;
}

export interface AIDataTransfer {
  data: AIGeneratedData;
  prompt: string;
}

/**
 * Guarda los datos generados por la IA en session storage
 */
export function saveAIGeneratedData(data: AIGeneratedData, prompt: string): void {
  try {
    const transferData: AIDataTransfer = {
      data,
      prompt
    };
    
    sessionStorage.setItem(AI_DATA_KEY, JSON.stringify(transferData));
  } catch (error) {
    console.warn('Error al guardar datos de IA en session storage:', error);
  }
}

/**
 * Recupera los datos generados por la IA del session storage
 */
export function getAIGeneratedData(): AIDataTransfer | null {
  try {
    const stored = sessionStorage.getItem(AI_DATA_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Verificar que los datos no sean muy antiguos (más de 30 minutos)
      const maxAge = 30 * 60 * 1000; // 30 minutos en milisegundos
      if (Date.now() - data.data.generatedAt < maxAge) {
        return data;
      } else {
        // Datos muy antiguos, limpiarlos
        clearAIGeneratedData();
      }
    }
  } catch (error) {
    console.warn('Error al recuperar datos de IA del session storage:', error);
  }
  return null;
}

/**
 * Limpia los datos generados por la IA del session storage
 */
export function clearAIGeneratedData(): void {
  try {
    sessionStorage.removeItem(AI_DATA_KEY);
    sessionStorage.removeItem(AI_PROMPT_KEY);
  } catch (error) {
    console.warn('Error al limpiar datos de IA del session storage:', error);
  }
}

/**
 * Verifica si hay datos generados disponibles
 */
export function hasAIGeneratedData(): boolean {
  return getAIGeneratedData() !== null;
}

/**
 * Guarda el prompt actual del usuario para recuperarlo si vuelve
 */
export function saveAIPrompt(prompt: string): void {
  try {
    sessionStorage.setItem(AI_PROMPT_KEY, prompt);
  } catch (error) {
    console.warn('Error al guardar prompt en session storage:', error);
  }
}

/**
 * Recupera el prompt guardado
 */
export function getAIPrompt(): string {
  try {
    return sessionStorage.getItem(AI_PROMPT_KEY) || '';
  } catch (error) {
    console.warn('Error al recuperar prompt del session storage:', error);
    return '';
  }
}

/**
 * Genera una URL con parámetros para indicar que se generaron datos
 */
export function generateReturnUrl(): string {
  return '/raffle/create?generated=true';
}

/**
 * Verifica si la página actual se cargó después de generar datos
 */
export function isReturningFromGeneration(): boolean {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('generated') === 'true';
}
