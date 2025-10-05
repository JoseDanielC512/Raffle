import type { Metadata } from "next";
import "./globals.css";
import ClientWrapper from "@/components/layout/client-wrapper";
import { Header } from "@/components/layout/header";
import { LogoutCoordinationProvider } from "@/context/logout-coordination-context";

export const metadata: Metadata = {
  title: "Lucky 100",
  description: "Create and manage 100-slot raffles with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-fondo-base">
        <LogoutCoordinationProvider>
          <ClientWrapper className="grid grid-rows-[auto_1fr] h-screen">
            {children}
          </ClientWrapper>
        </LogoutCoordinationProvider>
      </body>
    </html>
  );
}
