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
      <DialogContent className="sm:max-w-md mx-auto p-6 bg-muted border border-border rounded-2xl shadow-xl">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Building2 className="h-16 w-16 text-foreground animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-primary animate-spin" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            En Construcción 🚧
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-muted-foreground text-lg leading-relaxed">
            ¡Estamos trabajando duro para traerte <span className="font-semibold text-primary">{featureName}</span> muy pronto! 🔜
          </p>
          
          <div className="flex justify-center space-x-2 py-2">
            <Hammer className="h-8 w-8 text-muted-foreground" />
            <HardHat className="h-8 w-8 text-muted-foreground" />
            <Wrench className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="bg-accent rounded-lg p-4 border border-border">
            <div className="flex items-center justify-center gap-2 text-accent-foreground mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Tiempo estimado</span>
            </div>
            <p className="text-accent-foreground text-sm">
              Pronto estará disponible... ¡Mantente atento! ⏰
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button 
              onClick={onClose}
              variant="secondary"
            >
              Entendido 👍
            </Button>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Gracias por tu paciencia mientras construimos algo increíble para ti ✨
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
