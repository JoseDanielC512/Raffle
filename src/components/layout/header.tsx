import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card border-b">
      <Link href="/" className="flex items-center justify-center">
        <Ticket className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold font-headline">
          Rifa de la Suerte 100
        </span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        {/* This would be conditional based on auth state in a real app */}
        <Button variant="ghost" asChild>
          <Link href="/login">Iniciar Sesión</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Regístrate</Link>
        </Button>
      </nav>
    </header>
  );
}
