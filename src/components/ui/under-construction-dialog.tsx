'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Hammer, 
  HardHat, 
  Wrench, 
  Clock,
  Sparkles,
  Building2
} from 'lucide-react';

interface UnderConstructionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function UnderConstructionDialog({ 
  isOpen, 
  onClose, 
  featureName = "esta funcionalidad" 
}: UnderConstructionDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-auto p-6 bg-fondo-base dark:bg-primario-oscuro/90 border border-primario-oscuro/20 dark:border-primario-oscuro/40 rounded-2xl shadow-xl">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Building2 className="h-16 w-16 text-primario-oscuro dark:text-fondo-base animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-acento-fuerte animate-spin" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-primario-oscuro dark:text-fondo-base mb-2 flex items-center justify-center gap-2">
            En Construcción 🚧
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-primario-oscuro/80 dark:text-fondo-base/80 text-lg leading-relaxed">
            ¡Estamos trabajando duro para traerte <span className="font-semibold text-acento-fuerte">{featureName}</span> muy pronto! 🔜
          </p>
          
          <div className="flex justify-center space-x-2 py-2">
            <Hammer className="h-8 w-8 text-primario-oscuro/60 dark:text-fondo-base/60" />
            <HardHat className="h-8 w-8 text-primario-oscuro/60 dark:text-fondo-base/60" />
            <Wrench className="h-8 w-8 text-primario-oscuro/60 dark:text-fondo-base/60" />
          </div>

          <div className="bg-acento-calido rounded-lg p-4 border border-primario-oscuro/20">
            <div className="flex items-center justify-center gap-2 text-white mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Tiempo estimado</span>
            </div>
            <p className="text-white text-sm">
              Pronto estará disponible... ¡Mantente atento! ⏰
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button 
              onClick={onClose}
              variant="outline"
            >
              Entendido 👍
            </Button>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-primario-oscuro/20">
          <p className="text-xs text-primario-oscuro/60 dark:text-fondo-base/60">
            Gracias por tu paciencia mientras construimos algo increíble para ti ✨
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
