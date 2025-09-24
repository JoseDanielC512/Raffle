'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, List, User, Settings } from "lucide-react";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Mis Rifas", href: "/my-raffles", icon: List },
  { name: "Perfil", href: "/profile", icon: User },
  { name: "Ajustes", href: "/settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {links.map((link, idx) => (
        <Link
          key={idx}
          href={link.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            { "bg-muted text-primary": pathname === link.href }
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.name}
        </Link>
      ))}
    </nav>
  );
}