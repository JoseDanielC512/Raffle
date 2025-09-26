import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import ClientWrapper from "@/components/layout/client-wrapper";
import { Header } from "@/components/layout/header";
import { LogoutCoordinationProvider } from "@/context/logout-coordination-context";

const ptSans = PT_Sans({ 
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: '--font-sans',
});

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
      <body className={ptSans.className}>
        <LogoutCoordinationProvider>
          <ClientWrapper className="grid grid-rows-[auto_1fr] h-screen">
            {/* Header - hidden on auth pages */}
            <Header />
            <main className="overflow-auto">
              {children}
            </main>
          </ClientWrapper>
        </LogoutCoordinationProvider>
      </body>
    </html>
  );
}
