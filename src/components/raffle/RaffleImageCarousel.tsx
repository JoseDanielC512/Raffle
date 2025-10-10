'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';

interface RaffleImageCarouselProps {
  imageUrls: string[];
  raffleName: string;
}

export function RaffleImageCarousel({ imageUrls, raffleName }: RaffleImageCarouselProps) {
  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="aspect-video md:aspect-[16/10] lg:aspect-[21/9] flex flex-col items-center justify-center bg-muted/30 rounded-2xl border-2 border-dashed border-border/50">
        <ImageIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No hay imágenes para esta rifa.</p>
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {imageUrls.map((url, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="overflow-hidden rounded-xl border-border/50 shadow-lg">
                <div className="relative aspect-video md:aspect-[16/10] lg:aspect-[21/9]">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full h-full"
                  >
                    <Image
                      src={url}
                      alt={`${raffleName} - Imagen ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.png'; // Fallback image
                        target.alt = 'Imagen no disponible';
                      }}
                    />
                  </motion.div>
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 md:p-6">
                        <h3 className="text-sm md:text-base font-semibold text-white shadow-sm">
                            {`${raffleName} - Foto ${index + 1}`}
                        </h3>
                    </div>
                </div>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-primary-foreground backdrop-blur-sm transition-all sm:left-4" />
      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-primary-foreground backdrop-blur-sm transition-all sm:right-4" />
    </Carousel>
  );
}
