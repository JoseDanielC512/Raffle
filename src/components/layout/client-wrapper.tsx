'use client';

import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
