'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UnderConstructionDialog } from '@/components/ui/under-construction-dialog';

interface UnderConstructionContextType {
  showUnderConstructionDialog: (featureName: string) => void;
  isDialogOpen: boolean;
}

const UnderConstructionContext = createContext<UnderConstructionContextType | undefined>(undefined);

interface UnderConstructionProviderProps {
  children: ReactNode;
}

export function UnderConstructionProvider({ children }: UnderConstructionProviderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string>('esta funcionalidad');

  const showUnderConstructionDialog = (featureName: string) => {
    setCurrentFeature(featureName);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Mantenemos al usuario en la página actual, sin redirección
  };

  const value: UnderConstructionContextType = {
    showUnderConstructionDialog,
    isDialogOpen,
  };

  return (
    <UnderConstructionContext.Provider value={value}>
      {children}
      <UnderConstructionDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        featureName={currentFeature}
      />
    </UnderConstructionContext.Provider>
  );
}

export function useUnderConstructionContext() {
  const context = useContext(UnderConstructionContext);
  if (context === undefined) {
    throw new Error('useUnderConstructionContext must be used within an UnderConstructionProvider');
  }
  return context;
}
