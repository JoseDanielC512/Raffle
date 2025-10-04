'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, List, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnderConstructionContext } from "@/context/under-construction-context";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: Home, implemented: true },
  { name: "Mis Rifas", href: "/my-raffles", icon: List, implemented: false, featureName: "Mis Rifas" },
  { name: "Perfil", href: "/profile", icon: User, implemented: false, featureName: "Perfil de Usuario" },
  { name: "Ajustes", href: "/settings", icon: Settings, implemented: false, featureName: "Ajustes y Configuración" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { showUnderConstructionDialog } = useUnderConstructionContext();

  return (
    <nav className="grid items-start gap-2">
      {links.map((link, idx) => (
        <div key={idx}>
          {link.implemented ? (
            <Link
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                { "bg-muted text-primary": pathname === link.href }
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          ) : (
            <>
              {/* Enlace original comentado - {link.name}
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  { "bg-muted text-primary": pathname === link.href }
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link> */}
              
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary w-full justify-start",
                  { "bg-muted text-primary": pathname === link.href }
                )}
                onClick={() => showUnderConstructionDialog(link.featureName || link.name)}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Button>
            </>
          )}
        </div>
      ))}
    </nav>
  );
}
