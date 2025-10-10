"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-primario-oscuro",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-acento-calido/10 hover:bg-acento-calido/20 text-acento-fuerte border-acento-calido/20 p-0 opacity-70 hover:opacity-100 transition-all duration-200"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-primario-oscuro/70 rounded-md w-9 font-medium text-[0.8rem] bg-fondo-base/30",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-acento-calido/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-acento-calido/10 transition-all duration-200"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "rounded-md bg-acento-fuerte text-white hover:bg-acento-fuerte/90 focus:bg-acento-fuerte focus:text-white shadow-sm",
        day_today: "bg-barra-principal text-white hover:bg-barra-principal/90 font-semibold shadow-sm",
        day_outside:
          "day-outside text-muted-foreground/50 aria-selected:bg-acento-calido/10 aria-selected:text-muted-foreground/70",
        day_disabled: "text-muted-foreground/40 opacity-50 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-acento-calido/30 aria-selected:text-acento-fuerte/80",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
