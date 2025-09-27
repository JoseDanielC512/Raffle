import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import confetti from "canvas-confetti";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Dispara un efecto de confetti desde el centro de un elemento del DOM.
 * @param elementId El ID del elemento que será el origen del confetti.
 */
export async function triggerSlotConfetti(elementId: string): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  // Pequeña espera para asegurar que el elemento está renderizado,
  // especialmente si se llama justo después de un cambio de estado.
  const delay = 100; // 100ms, ajustable si es necesario
  await new Promise(resolve => setTimeout(resolve, delay));

  const element = document.getElementById(elementId);

  if (element) {
    const rect = element.getBoundingClientRect();
    const centerX = (rect.left + rect.width / 2) / window.innerWidth;
    const centerY = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 150,
      angle: 90,
      spread: 90,
      origin: { x: centerX, y: centerY },
      colors: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'], // Dorados y amarillos
      disableForReducedMotion: true,
    });
  } else {
    console.warn(`Element with ID "${elementId}" not found for confetti effect.`);
  }
}

/**
 * Formatea un valor numérico a moneda Peso Colombiano (COP).
 * @param value El valor numérico a formatear.
 * @returns El string formateado como moneda COP.
 */
export function formatCurrencyCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
