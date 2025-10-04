import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-skeleton rounded-md bg-fondo-base", className)}
      {...props}
    />
  )
}

export { Skeleton }
