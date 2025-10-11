'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { IconButton } from '@/components/ui/icon-button';
import { Upload, Sparkles, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageManagerProps {
  onImagesChange: (urls: string[]) => void;
  onGenerateAI: () => Promise<void>;
  isGenerating: boolean;
  existingImageUrls?: string[];
}

const MAX_IMAGES = 3;

export default function ImageManager({ 
  onImagesChange, 
  onGenerateAI, 
  isGenerating, 
  existingImageUrls = [] 
}: ImageManagerProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(existingImageUrls);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageUrls(existingImageUrls);
  }, [existingImageUrls]);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // This part needs a proper implementation to upload files and get URLs.
    // For now, we'll just log a message.
    console.log("File upload is not implemented in this refactoring.");
  };

  const handleRemoveImage = (index: number) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
    onImagesChange(newImageUrls);
  };

  const handleGenerateClick = async () => {
    await onGenerateAI();
  };

  const canAddMore = imageUrls.length < MAX_IMAGES;

  return (
    <div className="space-y-4">
      <Card className="border-dashed border-2 border-border/80 hover:border-primary/60 transition-colors duration-300">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canAddMore || isGenerating}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Subir Archivo ({imageUrls.length}/{MAX_IMAGES})
            </Button>
            <Button 
              type="button"
              variant="default"
              onClick={handleGenerateClick}
              disabled={!canAddMore || isGenerating}
              className="w-full bg-gradient-to-r from-acento-calido to-acento-fuerte text-white"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generar con IA
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            multiple
            disabled={!canAddMore || isGenerating}
          />
          {isGenerating && (
            <div className="space-y-2">
              <p className="text-sm text-center text-muted-foreground">
                Generando imágenes con IA...
              </p>
              <Progress value={undefined} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                Esto puede tardar hasta 30 segundos. Por favor, espera...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {imageUrls.map((src, index) => (
            <div key={index} className="relative group aspect-video">
              <Image
                src={src}
                alt={`Vista previa de imagen ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded-lg border"
              />
              <div className="absolute top-1 right-1">
                <IconButton
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveImage(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-destructive/80"
                  icon={<X className="h-4 w-4" />}
                  tooltip="Eliminar imagen"
                  tooltipSide="left"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {imageUrls.length === 0 && !isGenerating && (
         <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <ImageIcon className="h-10 w-10 mb-2 text-border" />
            <span>No hay imágenes seleccionadas.</span>
            <p>Sube hasta {MAX_IMAGES} imágenes o géneralas con IA.</p>
        </div>
      )}
    </div>
  );
}
