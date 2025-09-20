import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import ClientWrapper from "@/components/layout/client-wrapper";
import { Header } from "@/components/layout/header";

const ptSans = PT_Sans({ 
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Lucky 100 Raffle",
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
        <ClientWrapper>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ClientWrapper>
      </body>
    </html>
  );
}
