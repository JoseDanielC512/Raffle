import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & {
  showPasswordToggle?: boolean;
}>(
  ({ className, type, showPasswordToggle = false, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    
    // Solo mostrar el toggle si es de tipo password y la prop está activada
    const shouldShowToggle = type === "password" && showPasswordToggle;
    
    const togglePassword = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPassword(!showPassword);
    };

    // Para inputs normales (sin toggle), comportamiento estándar
    if (!shouldShowToggle) {
      return (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
      )
    }

    // Para passwords con toggle - implementación con captura directa de caracteres
    const [internalRealValue, setInternalRealValue] = React.useState("");
    const [cursorPosition, setCursorPosition] = React.useState(0);
    
    // Determinar si estamos en modo controlado o interno
    const isControlled = value !== undefined;
    const currentRealValue = isControlled ? String(value || "") : internalRealValue;
    
    // Sincronizar valor interno cuando cambia el valor externo
    React.useEffect(() => {
      if (isControlled) {
        setInternalRealValue(String(value || ""));
      }
    }, [value, isControlled]);

    // Valor que se muestra en el input
    const displayValue = showPassword ? currentRealValue : "•".repeat(currentRealValue.length);

    const updateValue = (newValue: string, newCursorPosition?: number) => {
      if (!isControlled) {
        setInternalRealValue(newValue);
      }
      
      // Actualizar posición del cursor si se especifica
      if (newCursorPosition !== undefined) {
        setCursorPosition(newCursorPosition);
      }
      
      // Crear evento sintético para React Hook Form
      const syntheticEvent = {
        target: {
          value: newValue
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange?.(syntheticEvent);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Solo funciona cuando showPassword es true
      if (showPassword) {
        const newValue = e.target.value;
        if (!isControlled) {
          setInternalRealValue(newValue);
        }
        onChange?.(e);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showPassword) {
        // Cuando está visible, comportamiento normal
        return;
      }
      
      // Permitir shortcuts comunes (Ctrl+V, Ctrl+C, Ctrl+X, Ctrl+A)
      if ((e.ctrlKey || e.metaKey) && ['v', 'c', 'x', 'a'].includes(e.key.toLowerCase())) {
        // Permitir comportamiento por defecto para shortcuts
        return;
      }
      
      const target = e.target as HTMLInputElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      
      // Manejar caracteres imprimibles
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        
        let newValue: string;
        let newCursorPos: number;
        
        if (start === end) {
          // Insertar carácter en la posición del cursor
          newValue = currentRealValue.slice(0, start) + e.key + currentRealValue.slice(start);
          newCursorPos = start + 1;
        } else {
          // Reemplazar selección
          newValue = currentRealValue.slice(0, start) + e.key + currentRealValue.slice(end);
          newCursorPos = start + 1;
        }
        
        updateValue(newValue, newCursorPos);
        return;
      }
      
      // Manejar Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        
        if (start === end) {
          // Borrar carácter anterior
          if (start > 0) {
            const newValue = currentRealValue.slice(0, start - 1) + currentRealValue.slice(start);
            updateValue(newValue, start - 1);
          }
        } else {
          // Borrar selección
          const newValue = currentRealValue.slice(0, start) + currentRealValue.slice(end);
          updateValue(newValue, start);
        }
        return;
      }
      
      // Manejar Delete
      if (e.key === 'Delete') {
        e.preventDefault();
        
        if (start === end) {
          // Borrar carácter siguiente
          if (start < currentRealValue.length) {
            const newValue = currentRealValue.slice(0, start) + currentRealValue.slice(start + 1);
            updateValue(newValue, start);
          }
        } else {
          // Borrar selección
          const newValue = currentRealValue.slice(0, start) + currentRealValue.slice(end);
          updateValue(newValue, start);
        }
        return;
      }
      
      // Manejar Enter (no hacer nada especial)
      if (e.key === 'Enter') {
        return;
      }
      
      // Manejar teclas de navegación
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        // Permitir comportamiento por defecto para navegación
        return;
      }
      
      // Prevenir otras teclas
      e.preventDefault();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      if (showPassword) {
        // Comportamiento normal cuando está visible
        return;
      }
      
      e.preventDefault();
      
      try {
        const target = e.target as HTMLInputElement;
        const start = target.selectionStart || 0;
        const end = target.selectionEnd || 0;
        
        // Obtener texto del clipboard con manejo de errores
        let pastedText = '';
        try {
          pastedText = e.clipboardData.getData('text');
        } catch (clipboardError) {
          console.warn('Error al acceder al clipboard:', clipboardError);
          // Intentar métodos alternativos
          try {
            pastedText = e.clipboardData.getData('text/plain');
          } catch (fallbackError) {
            console.warn('Error al acceder al clipboard (fallback):', fallbackError);
            return; // No podemos obtener el texto pegado
          }
        }
        
        // Si no hay texto pegado, salir
        if (!pastedText) {
          return;
        }
        
        // Insertar texto pegado
        const newValue = currentRealValue.slice(0, start) + pastedText + currentRealValue.slice(end);
        const newCursorPos = start + pastedText.length;
        
        updateValue(newValue, newCursorPos);
      } catch (error) {
        console.error('Error en handlePaste:', error);
      }
    };

    // Efecto para mantener la posición del cursor
    React.useEffect(() => {
      if (!showPassword && cursorPosition !== undefined) {
        // Usar un timeout para asegurar que el DOM se actualizó
        const timer = setTimeout(() => {
          const input = document.querySelector(`input[autocomplete="new-password"]`) as HTMLInputElement;
          if (input) {
            input.setSelectionRange(cursorPosition, cursorPosition);
          }
        }, 0);
        
        return () => clearTimeout(timer);
      }
    }, [displayValue, cursorPosition, showPassword]);

    return (
      <div className="relative">
        <input
          type="text" // Siempre text para evitar controles nativos
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-12",
            className
          )}
          ref={ref}
          autoComplete="new-password"
          spellCheck={false}
          {...props}
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-acento-calido transition-colors"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
