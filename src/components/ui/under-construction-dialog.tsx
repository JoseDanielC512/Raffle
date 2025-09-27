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
      <DialogContent className="sm:max-w-md mx-auto p-6 bg-battleship_gray-300 dark:bg-battleship_gray-700 border border-battleship_gray-300 dark:border-battleship_gray-700 rounded-2xl shadow-xl">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Building2 className="h-16 w-16 text-battleship_gray-900 dark:text-battleship_gray-100 animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-ultra_violet-500 animate-spin" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-battleship_gray-900 dark:text-battleship_gray-100 mb-2 flex items-center justify-center gap-2">
            En Construcción 🚧
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-battleship_gray-600 dark:text-battleship_gray-400 text-lg leading-relaxed">
            ¡Estamos trabajando duro para traerte <span className="font-semibold text-ultra_violet-500">{featureName}</span> muy pronto! 🔜
          </p>
          
          <div className="flex justify-center space-x-2 py-2">
            <Hammer className="h-8 w-8 text-battleship_gray-600 dark:text-battleship_gray-400" />
            <HardHat className="h-8 w-8 text-battleship_gray-600 dark:text-battleship_gray-400" />
            <Wrench className="h-8 w-8 text-battleship_gray-600 dark:text-battleship_gray-400" />
          </div>

          <div className="bg-tekhelet-500 rounded-lg p-4 border border-battleship_gray-300 dark:border-battleship_gray-700">
            <div className="flex items-center justify-center gap-2 text-tekhelet-100 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Tiempo estimado</span>
            </div>
            <p className="text-tekhelet-100 text-sm">
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

        <div className="text-center pt-4 border-t border-battleship_gray-300 dark:border-battleship_gray-700">
          <p className="text-xs text-battleship_gray-600 dark:text-battleship_gray-400">
            Gracias por tu paciencia mientras construimos algo increíble para ti ✨
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
