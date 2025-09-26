'use client';

import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthNavigationHandler } from "./auth-navigation-handler";
import { UnderConstructionProvider } from "@/context/under-construction-context";

export default function ClientWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <AuthProvider>
      <AuthNavigationHandler />
      <TooltipProvider>
        <UnderConstructionProvider>
          <div className={className}>
            {children}
            <Toaster />
          </div>
        </UnderConstructionProvider>
      </TooltipProvider>
    </AuthProvider>
  );
}
