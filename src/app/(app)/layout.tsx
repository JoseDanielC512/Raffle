import Header from "@/components/layout/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // In a real app, this layout would be protected, redirecting
  // unauthenticated users to the login page.
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
