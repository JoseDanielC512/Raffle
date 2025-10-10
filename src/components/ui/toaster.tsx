"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

// Función para obtener el emoji según la variante
const getEmoji = (variant?: string | null) => {
  switch (variant) {
    case "success":
      return "🍀";
    case "warning":
      return "⚠️";
    case "destructive":
      return "❌";
    case "info":
      return "ℹ️";
    default:
      return "📢";
  }
};

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const emoji = getEmoji(variant);
        
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
