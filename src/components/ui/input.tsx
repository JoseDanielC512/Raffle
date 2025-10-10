import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & {
  showPasswordToggle?: boolean;
}>(
  ({ className, type, showPasswordToggle = false, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [internalRealValue, setInternalRealValue] = React.useState("");
    const [cursorPosition, setCursorPosition] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    // Fusionar refs
    const mergedRef = React.useCallback((node: HTMLInputElement | null) => {
      if (inputRef) {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    }, [ref]);
    
    // Solo mostrar el toggle si es de tipo password y la prop está activada
    const shouldShowToggle = type === "password" && showPasswordToggle;
    
    const togglePassword = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPassword(!showPassword);
    };

    // Estado para manejar composición (importante para móviles)
    const [isComposing, setIsComposing] = React.useState(false);
    const [compositionData, setCompositionData] = React.useState('');

    // Para passwords con toggle - implementación mejorada para móviles
    const isControlled = value !== undefined;
    const currentRealValue = isControlled ? String(value || "") : internalRealValue;
    
    // Sincronizar valor interno cuando cambia el valor externo
    React.useEffect(() => {
      if (isControlled) {
        setInternalRealValue(String(value || ""));
      }
    }, [value, isControlled]);

    // Valor que se muestra en el input
    const displayValue = shouldShowToggle && !showPassword ? "•".repeat(currentRealValue.length) : currentRealValue;

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
      // SIEMPER permitir la entrada de texto cuando es password con toggle
      // La visualización (bullets vs texto) se maneja por separado
      if (!shouldShowToggle) {
        // Comportamiento normal para inputs sin toggle
        onChange?.(e);
        return;
      }
      
      // Para passwords con toggle, siempre permitir la entrada
      const target = e.target;
      const inputValue = target.value;
      
      // Si estamos en modo oculto, necesitamos procesar los bullets
      if (!showPassword) {
        // Los bullets son solo visuales, el valor real debe manejarse internamente
        // No actualizamos directamente desde el input cuando muestra bullets
        return; // El manejo real se hace en handleKeyDown y handleCompositionEnd
      }
      
      // Cuando está visible, comportamiento normal
      if (!isControlled) {
        setInternalRealValue(inputValue);
      }
      onChange?.(e);
    };

    // Nuevo manejador para input events (mejor para móviles)
    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      if (!shouldShowToggle) {
        // Comportamiento normal para inputs sin toggle
        onChange?.(e as React.ChangeEvent<HTMLInputElement>);
        return;
      }
      
      // Para passwords con toggle
      const target = e.target as HTMLInputElement;
      
      if (showPassword) {
        // Cuando está visible, comportamiento normal
        const newValue = target.value;
        if (!isControlled) {
          setInternalRealValue(newValue);
        }
        onChange?.(e as React.ChangeEvent<HTMLInputElement>);
      }
      // Cuando está oculto, no procesamos el input directamente aquí
      // porque el valor mostrado son bullets, no el texto real
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!shouldShowToggle || showPassword) {
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
      if (!shouldShowToggle || showPassword) {
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

    // Efecto para mantener la posición del cursor (simplificado y más robusto)
    React.useEffect(() => {
      if (shouldShowToggle && !showPassword && cursorPosition !== undefined && inputRef.current && !isComposing) {
        // Solo intentar establecer la posición del cursor si no está en composición
        // y si la posición es válida para el largo actual
        if (cursorPosition >= 0 && cursorPosition <= displayValue.length) {
          // Usar setTimeout para asegurar que el DOM se actualizó
          const timer = setTimeout(() => {
            if (inputRef.current && document.activeElement === inputRef.current) {
              try {
                inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
              } catch (error) {
                // Ignorar errores silenciosamente en móviles
                // Es normal que algunos navegadores móviles fallen aquí
              }
            }
          }, 0);
          
          return () => clearTimeout(timer);
        }
      }
    }, [displayValue, cursorPosition, showPassword, shouldShowToggle, isComposing]);

    // Manejo de composición para input methods (crítico para móviles)
    const handleCompositionStart = (e: React.CompositionEvent<HTMLInputElement>) => {
      if (shouldShowToggle && !showPassword) {
        setIsComposing(true);
        setCompositionData('');
        
        const target = e.target as HTMLInputElement;
        const start = target.selectionStart || 0;
        const end = target.selectionEnd || 0;
        
        // Guardar el estado antes de la composición
        setCursorPosition(start);
      }
    };

    const handleCompositionUpdate = (e: React.CompositionEvent<HTMLInputElement>) => {
      if (shouldShowToggle && !showPassword && isComposing) {
        const target = e.target as HTMLInputElement;
        const start = target.selectionStart || 0;
        const end = target.selectionEnd || 0;
        
        // Actualizar datos de composición
        setCompositionData(e.data || '');
        
        // Para previsualización en móviles (opcional)
        // Podríamos mostrar los caracteres temporalmente si es necesario
      }
    };

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
      if (shouldShowToggle && !showPassword && isComposing) {
        const target = e.target as HTMLInputElement;
        const start = target.selectionStart || 0;
        const end = target.selectionEnd || 0;
        const composedText = e.data || compositionData;
        
        if (composedText) {
          // Insertar texto compuesto en la posición correcta
          const newValue = currentRealValue.slice(0, start) + composedText + currentRealValue.slice(end);
          const newCursorPos = start + composedText.length;
          updateValue(newValue, newCursorPos);
        }
        
        setIsComposing(false);
        setCompositionData('');
      } else {
        // Para modo visible o inputs normales, comportamiento estándar
        setIsComposing(false);
        setCompositionData('');
      }
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

    return (
      <div className="relative">
        <input
          type="text" // Siempre text para evitar controles nativos
          value={displayValue}
          onChange={handleChange}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={handleCompositionStart}
          onCompositionUpdate={handleCompositionUpdate}
          onCompositionEnd={handleCompositionEnd}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-12",
            className
          )}
          ref={mergedRef}
          autoComplete="new-password"
          spellCheck={false}
          inputMode="text" // Mejor para móviles
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
