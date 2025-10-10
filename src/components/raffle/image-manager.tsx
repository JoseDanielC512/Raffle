'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { IconButton } from '@/components/ui/icon-button';
import { Upload, Sparkles, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageManagerProps {
  onImagesChange: (files: File[]) => void;
  onGenerateAI: () => Promise<File[]>; // Updated to return a promise of files
  isGenerating: boolean;
}

const MAX_IMAGES = 3;

export default function ImageManager({ onImagesChange, onGenerateAI, isGenerating }: ImageManagerProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, MAX_IMAGES - imageFiles.length);
    if (newFiles.length === 0) return;

    const newFileObjects = [...imageFiles, ...newFiles];
    setImageFiles(newFileObjects);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    onImagesChange(newFileObjects);
  };

  const handleRemoveImage = (index: number) => {
    const newFileObjects = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newFileObjects);

    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    newPreviews.forEach(preview => URL.revokeObjectURL(preview)); // Clean up
    setImagePreviews(newPreviews);

    onImagesChange(newFileObjects);
  };

  const handleGenerateClick = async () => {
    setIsLoading(true);
    try {
      const generatedFiles = await onGenerateAI();
      // Assuming onGenerateAI now returns the files
      const newFileObjects = [...imageFiles, ...generatedFiles].slice(0, MAX_IMAGES);
      setImageFiles(newFileObjects);

      const newPreviews = generatedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews].slice(0, MAX_IMAGES));
      
      onImagesChange(newFileObjects);
    } catch (error) {
      console.error("Failed to generate AI images:", error);
      // Error handling is now managed by the parent component with toast
    } finally {
      setIsLoading(false);
    }
  };

  const canAddMore = imageFiles.length < MAX_IMAGES;

  return (
    <div className="space-y-4">
      <Card className="border-dashed border-2 border-border/80 hover:border-primary/60 transition-colors duration-300">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canAddMore || isLoading || isGenerating}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Subir Archivo ({imageFiles.length}/{MAX_IMAGES})
            </Button>
            <Button 
              type="button"
              variant="default"
              onClick={handleGenerateClick}
              disabled={!canAddMore || isLoading || isGenerating}
              className="w-full bg-gradient-to-r from-acento-calido to-acento-fuerte text-white"
            >
              {isLoading ? (
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
            disabled={!canAddMore || isLoading || isGenerating}
          />
          {(isLoading || isGenerating) && (
            <div className="space-y-2">
              <p className="text-sm text-center text-muted-foreground">
                {isGenerating ? 'Finalizando creación de la rifa...' : 'Generando imágenes con IA...'}
              </p>
              <Progress value={undefined} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                Esto puede tardar hasta 30 segundos. Por favor, espera...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {imagePreviews.map((src, index) => (
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

      {imagePreviews.length === 0 && !isLoading && !isGenerating && (
         <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <ImageIcon className="h-10 w-10 mb-2 text-border" />
            <span>No hay imágenes seleccionadas.</span>
            <p>Sube hasta {MAX_IMAGES} imágenes o géneralas con IA.</p>
        </div>
      )}
    </div>
  );
}
