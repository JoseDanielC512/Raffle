'use client';

import { useState, useEffect } from 'react';
import { createRaffleAction, generateRaffleImagesAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { IconButton } from '@/components/ui/icon-button';
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { 
  getAIGeneratedData, 
  clearAIGeneratedData, 
  isReturningFromGeneration,
  type AIGeneratedData 
} from '@/lib/ai-data-transfer';
import ImageManager from './image-manager';

type CreateState = {
  message: string | null;
  success?: boolean;
  raffleId?: string;
};

function RaffleSubmitButton({ isCreating }: { isCreating: boolean }) {
  return (
    <Button type="submit" disabled={isCreating} className="w-full">
      {isCreating ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando Rifa...</>
      ) : (
        'Crear Rifa'
      )}
    </Button>
  );
}

export function CreateRaffleForm() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [slotPrice, setSlotPrice] = useState<number>(1000); // Default value
  const [finalizationDate, setFinalizationDate] = useState<Date | undefined>();
  const [idToken, setIdToken] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [hasGeneratedData, setHasGeneratedData] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Estado para los archivos de imagen

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setIdToken);
    }
  }, [user]);

  // Cargar datos generados al montar el componente
  useEffect(() => {
    if (isReturningFromGeneration()) {
      const aiData = getAIGeneratedData();
      if (aiData) {
        // Cargar los datos generados en el formulario
        if (aiData.data.name) setName(aiData.data.name);
        if (aiData.data.description) setDescription(aiData.data.description);
        if (aiData.data.terms) setTerms(aiData.data.terms);
        
        setHasGeneratedData(true);
        
        toast({
          title: 'Contenido cargado',
          description: 'Los datos generados por la IA han sido aplicados al formulario.',
          variant: 'success',
        });
        
        // Limpiar los datos del session storage después de cargarlos
        clearAIGeneratedData();
        
        // Limpiar el parámetro URL
        const url = new URL(window.location.href);
        url.searchParams.delete('generated');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);

  const handleOpenAIHelper = () => {
    router.push('/raffle/create/ai');
  };

  const validateForm = () => {
    const errors = [];
    
    if (!name.trim()) {
      errors.push('El nombre de la rifa es requerido');
    }
    
    if (!description.trim()) {
      errors.push('La descripción es requerida');
    }
    
    if (!terms.trim()) {
      errors.push('Los términos y condiciones son requeridos');
    }
    
    if (!slotPrice || slotPrice < 1) {
      errors.push('El precio de la casilla debe ser mayor a 0');
    }
    
    return errors;
  };

  const handleGenerateAIImages = async (): Promise<File[]> => {
    if (!description.trim()) {
      toast({
        title: 'Descripción requerida',
        description: 'Por favor, escribe una descripción del premio para generar las imágenes.',
        variant: 'destructive',
      });
      return [];
    }

    setIsGeneratingImages(true);
    try {
      const result = await generateRaffleImagesAction(description, idToken);
      if (result.error || !result.urls) {
        throw new Error(result.error || 'No se recibieron URLs de las imágenes.');
      }

      toast({ title: 'Imágenes generadas', description: 'Ahora se están descargando para adjuntarlas.', variant: 'success' });

      // Convert URLs to File objects
      const files = await Promise.all(result.urls.map(async (url, index) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], `ai-generated-${index + 1}.png`, { type: 'image/png' });
      }));

      return files;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
      toast({
        title: 'Error al generar imágenes',
        description: errorMessage,
        variant: 'destructive',
      });
      return []; // Return empty array on failure
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validar el formulario antes de enviar
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: 'Error de validación',
        description: validationErrors.join('. '),
        variant: 'destructive',
      });
      return;
    }
    
    setIsCreating(true);
    const formData = new FormData(event.currentTarget);

    // Adjuntar archivos de imagen al FormData
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
    
    try {
      const result: CreateState = await createRaffleAction({ message: null }, formData);

      if (result.success && result.message) {
        toast({
          title: 'Rifa creada con éxito',
          description: result.message,
          variant: 'success',
        });
        if (result.raffleId) {
          router.push(`/raffle/${result.raffleId}`);
          router.refresh();
        }
      } else if (!result.success && result.message) {
        toast({
          title: 'Error al crear rifa',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error Inesperado',
        description: 'Ocurrió un error al crear la rifa.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const isFormDisabled = authLoading || !user;

  return (
    <div className="w-full">
      <form onSubmit={handleCreateSubmit} className="space-y-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 group rounded-2xl">
          <CardHeader className="relative overflow-hidden rounded-t-2xl border-b-transparent pb-4 flex flex-row items-center justify-between bg-gradient-to-r from-acento-fuerte/90 via-acento-fuerte/80 to-acento-calido/90 p-6 text-white">
            {/* Efecto de brillo sutil */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-acento-calido/5 to-acento-fuerte/10 opacity-30"></div>
            
            <div className="relative z-10 flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl md:text-2xl font-bold text-white">
                  Detalles de la Rifa
                </CardTitle>
              </div>
            </div>
            <IconButton
              type="button"
              icon={hasGeneratedData ? <Sparkles className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
              onClick={handleOpenAIHelper}
              tooltip={hasGeneratedData ? "Editar contenido generado" : "Generar contenido con IA"}
              tooltipSide="bottom"
              aria-label={hasGeneratedData ? "Editar contenido generado" : "Generar contenido con IA"}
              className={cn(
                "relative z-20 backdrop-blur-sm transition-all duration-200",
                hasGeneratedData 
                  ? "bg-green-500/20 hover:bg-green-500/30 text-green-100 border-green-400/30" 
                  : "bg-white/20 hover:bg-white/30 text-white border-white/30"
              )}
            />
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {isFormDisabled && (
              <p className="text-sm text-center text-acento-calido bg-acento-calido/10 p-3 rounded-md border border-acento-calido/30">
                Debes iniciar sesión para poder crear una rifa.
              </p>
            )}
            <input type="hidden" name="idToken" value={idToken} />
            <input type="hidden" name="finalizationDate" value={finalizationDate ? finalizationDate.toISOString() : ''} />
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Rifa</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Rifa Increíble de PS5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isFormDisabled || isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slotPrice">Precio de la Casilla (COP)</Label>
              <Input 
                id="slotPrice" 
                name="slotPrice" 
                type="number"
                placeholder="1000"
                value={slotPrice}
                onChange={(e) => setSlotPrice(Number(e.target.value))}
                disabled={isFormDisabled || isCreating}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe los detalles emocionantes de tu rifa aquí."
                className="min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isFormDisabled || isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Términos y Condiciones</Label>
              <Textarea
                id="terms"
                name="terms"
                placeholder="Define las reglas: fecha del sorteo, cómo se elegirá al ganador, etc."
                className="min-h-[100px]"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                disabled={isFormDisabled || isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Finalización (Opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !finalizationDate && 'text-muted-foreground'
                    )}
                    disabled={isFormDisabled || isCreating}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {finalizationDate ? format(finalizationDate, 'PPP', { locale: es }) : <span>Seleccionar una fecha</span>}
                  </Button>
                </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                    <div className="bg-card/95 backdrop-blur-sm border border-acento-calido/20 rounded-lg shadow-lg">
                      <Calendar
                        mode="single"
                        selected={finalizationDate}
                        onSelect={setFinalizationDate}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0)) // Deshabilitar fechas pasadas
                        }
                        initialFocus
                        locale={es}
                        className="rounded-lg bg-transparent"
                      />
                    </div>
                  </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Imágenes de la Rifa</Label>
              <ImageManager 
                onImagesChange={setImageFiles} 
                onGenerateAI={handleGenerateAIImages}
                isGenerating={isGeneratingImages || isCreating}
              />
            </div>
            <div className="pt-6">
              <RaffleSubmitButton isCreating={isCreating} />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
