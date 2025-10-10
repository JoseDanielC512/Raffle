'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateDetailsAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IconButton } from '@/components/ui/icon-button';
import { 
  Sparkles, 
  Lightbulb, 
  Wand2, 
  Zap, 
  Copy, 
  CheckCircle,
  Target,
  Gift,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  saveAIGeneratedData, 
  saveAIPrompt, 
  getAIPrompt, 
  generateReturnUrl,
  clearAIGeneratedData,
  type AIGeneratedData 
} from '@/lib/ai-data-transfer';

// Define the types for the action states
type GenerateState = {
  name?: string;
  description?: string;
  terms?: string;
  message?: string | null;
  errors?: Record<string, string[] | undefined> | undefined;
};

const examplePrompts = [
  {
    id: 'gaming',
    title: 'Gaming',
    description: 'Consolas y videojuegos',
    icon: <Zap className="h-4 w-4" />,
    prompt: 'Una PlayStation 5 nueva en caja con dos controles DualSense y los juegos God of War Ragnarök y Spider-Man 2.'
  },
  {
    id: 'tech',
    title: 'Tecnología',
    description: 'Gadgets y accesorios',
    icon: <Target className="h-4 w-4" />,
    prompt: 'iPhone 15 Pro Max de 256GB color titanio negro con funda de cuero y cargador rápido MagSafe.'
  },
  {
    id: 'home',
    title: 'Hogar',
    description: 'Artículos para el hogar',
    icon: <Gift className="h-4 w-4" />,
    prompt: 'Sofá cama de 3 plazas color gris oscuro con estructura metálica y cojines decorativos incluidos.'
  },
  {
    id: 'experience',
    title: 'Experiencias',
    description: 'Viajes y eventos',
    icon: <Sparkles className="h-4 w-4" />,
    prompt: 'Paquete para 2 personas a Cartagena por 3 días con hotel 4 estrellas, tours ciudad y vuelos incluidos.'
  }
];

export default function AIAssistantPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState('');
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateErrors, setGenerateErrors] = useState<Record<string, string[] | undefined> | undefined>();

  // Cargar prompt guardado al montar el componente
  useEffect(() => {
    const savedPrompt = getAIPrompt();
    if (savedPrompt) {
      setPrompt(savedPrompt);
    }
  }, []);

  // Guardar prompt actual cuando cambie
  useEffect(() => {
    if (prompt.trim()) {
      saveAIPrompt(prompt);
    }
  }, [prompt]);

  const steps = [
    {
      id: 1,
      color: 'bg-acento-fuerte',
      title: 'Describe tu premio',
      description: 'Sé específico: marca, modelo, características, estado, etc.'
    },
    {
      id: 2,
      color: 'bg-acento-calido',
      title: 'IA genera contenido',
      description: 'Crea nombre, descripción y términos atractivos'
    },
    {
      id: 3,
      color: 'bg-barra-principal',
      title: 'Personaliza si quieres',
      description: 'Puedes editar todo el contenido generado'
    }
  ];

  const toggleStep = (stepId: number) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const handleExampleClick = (examplePrompt: string, exampleId: string) => {
    setPrompt(examplePrompt);
    
    // Efecto visual de copiado
    setCopiedExample(exampleId);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGenerateErrors(undefined);
    
    // Crear FormData manualmente con el prompt
    const formData = new FormData();
    formData.append('prompt', prompt);
    
    try {
      const result: GenerateState = await generateDetailsAction({ message: null }, formData);
      
      if (result.name || result.description || result.terms) {
        // Guardar datos generados en session storage
        const generatedData: AIGeneratedData = {
          name: result.name,
          description: result.description,
          terms: result.terms,
          generatedAt: Date.now()
        };
        
        saveAIGeneratedData(generatedData, prompt);
        
        toast({
          title: 'Contenido generado exitosamente',
          description: 'Redirigiendo al formulario de creación...',
          variant: 'success',
        });
        
        // Redirigir al formulario principal con los datos generados
        setTimeout(() => {
          router.push(generateReturnUrl());
        }, 1000);
      } else if (result.errors) {
        setGenerateErrors(result.errors);
        toast({
          title: 'Error en la generación',
          description: 'Revisa el formulario e intenta de nuevo.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al generar contenido:', error);
      toast({
        title: 'Error de IA',
        description: 'No se pudo generar el contenido. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoBack = () => {
    router.push('/raffle/create');
  };

  return (
    <div className="space-y-6">
      {/* Header con navegación de regreso */}
      <div className="flex items-center gap-3">
        <IconButton
          onClick={handleGoBack}
          icon={<ArrowLeft className="h-5 w-5" />}
          tooltip="Volver al formulario"
          tooltipSide="bottom"
          aria-label="Volver al formulario de creación"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold font-headline truncate">Asistente de Creación IA</h1>
          <p className="text-primario-oscuro/60 text-sm md:text-base mt-1">
            Describe tu premio y crea contenido profesional en segundos
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <div className="space-y-6">
          {/* Card principal con el asistente */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 group rounded-2xl">
            <CardHeader className="relative overflow-hidden rounded-t-2xl border-b-transparent pb-4 bg-gradient-to-r from-acento-fuerte/90 via-acento-fuerte/80 to-acento-calido/90 p-6 text-white">
              {/* Efecto de brillo sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-acento-calido/5 to-acento-fuerte/10 opacity-30"></div>
              
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <Wand2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl md:text-2xl font-bold text-white">
                    Crea contenido para tu rifa
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              {/* Sección de cómo funciona */}
              <Card className="bg-card/90 backdrop-blur-sm border border-border/60 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Lightbulb className="h-5 w-5 text-acento-fuerte" />
                    ¿Cómo funciona?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contenedor de pasos - optimizado para mobile */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-2 overflow-x-hidden">
                    {steps.map((step, index) => (
                      <div key={step.id} className="relative flex flex-col items-center flex-1 min-w-0">
                        {/* Línea conectora horizontal - solo en desktop */}
                        {index < steps.length - 1 && (
                          <div className="hidden sm:block absolute top-4 left-[calc(50%+1rem)] w-[calc(100%-2rem)] h-0.5 bg-border/40 -z-10"></div>
                        )}
                        
                        {/* Paso */}
                        <div className="flex flex-col items-center text-center w-full">
                          {/* Círculo del paso */}
                          <button
                            onClick={() => toggleStep(step.id)}
                            className={cn(
                              "w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold transition-all duration-200 mb-2 flex-shrink-0",
                              step.color,
                              expandedStep === step.id ? "ring-2 ring-offset-2 ring-ring" : "",
                              expandedStep !== step.id && "hover:scale-110"
                            )}
                          >
                            {step.id}
                          </button>
                          
                          {/* Título del paso */}
                          <button
                            onClick={() => toggleStep(step.id)}
                            className="text-center w-full px-1"
                          >
                            <p className="font-medium text-foreground text-sm hover:text-primary transition-colors leading-tight break-words">
                              {step.title}
                            </p>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Área de descripción expandible */}
                  <div className="min-h-[60px]">
                    {expandedStep && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="text-center p-4 bg-muted/30 rounded-lg border border-border/40"
                      >
                        <p className="text-sm text-muted-foreground">
                          {steps.find(s => s.id === expandedStep)?.description}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Ideas rápidas */}
              <div>
                <Label className="text-base font-medium flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-acento-fuerte" />
                  Ideas rápidas
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {examplePrompts.map((example) => (
                    <button
                      key={example.id}
                      onClick={() => handleExampleClick(example.prompt, example.id)}
                      disabled={isGenerating}
                      className={cn(
                        "text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-sm min-w-0",
                        copiedExample === example.id 
                          ? "bg-acento-fuerte/10 border-acento-fuerte/30" 
                          : "bg-card/80 border-border/60 hover:bg-card/90"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {example.icon}
                        <span className="font-medium text-sm truncate flex-shrink-0">{example.title}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">• {example.description}</span>
                        {copiedExample === example.id ? (
                          <CheckCircle className="h-3 w-3 text-green-500 ml-auto flex-shrink-0" />
                        ) : (
                          <Copy className="h-3 w-3 text-muted-foreground ml-auto flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulario de generación */}
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt" className="text-base font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-acento-fuerte" />
                    Describe tu premio
                  </Label>
                  <Textarea
                    id="ai-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ej: Una consola Nintendo Switch OLED modelo 2023 color blanco con 32GB de almacenamiento, funda protectora, pantalla de 7 pulgadas, 64GB de tarjeta SD incluida y los juegos Zelda Tears of the Kingdom y Mario Kart 8 Deluxe..."
                    className="min-h-[120px] resize-none border focus:border-acento-fuerte transition-colors w-full"
                    disabled={isGenerating}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      💡 Cuantos más detalles incluyas, mejor será el contenido generado
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {prompt.length} caracteres
                    </span>
                  </div>
                  {generateErrors?.prompt && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                      <span>⚠️</span>
                      <span>{generateErrors.prompt.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleGoBack}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!prompt.trim() || isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Generando...
                      </>
                    ) : (
                      'Generar con IA'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
