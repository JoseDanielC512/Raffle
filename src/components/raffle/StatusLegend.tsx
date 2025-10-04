import { Circle, Clock, CheckCircle, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusLegendProps = {
  availableSlots: number;
  reservedSlots: number;
  paidSlots: number;
  highlightedStatus: string | null;
  setHighlightedStatus: (status: string | null) => void;
};

export default function StatusLegend({
  availableSlots,
  reservedSlots,
  paidSlots,
  highlightedStatus,
  setHighlightedStatus,
}: StatusLegendProps) {
  const legendItems = [
    {
      status: "available",
      label: "Disponibles",
      count: availableSlots,
      icon: Circle,
      colorClasses: "bg-gradient-to-br from-slot-available to-slot-available/80 text-white",
    },
    {
      status: "reserved",
      label: "Reservadas",
      count: reservedSlots,
      icon: Clock,
      colorClasses: "bg-gradient-to-br from-slot-reserved to-slot-reserved/80 text-white",
    },
    {
      status: "paid",
      label: "Pagadas",
      count: paidSlots,
      icon: CheckCircle,
      colorClasses: "bg-gradient-to-br from-slot-paid to-slot-paid/80 text-white",
    },
    {
      status: "winner", // Este estado es especial y no viene de los props de conteo
      label: "Ganadora",
      count: 1, // Siempre habrá una ganadora al finalizar
      icon: Crown,
      colorClasses: "bg-gradient-to-br from-slot-winning to-slot-winning/80 text-primario-oscuro",
    },
  ];

  return (
    <div className="flex justify-center items-center gap-4 md:gap-6 mt-6 pt-4 border-t border-primario-oscuro/20 flex-wrap">
      {legendItems.map((item) => {
        const Icon = item.icon;
        const isHighlighted = highlightedStatus === item.status;
        return (
          <div
            key={item.status}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 border-2 border-transparent hover:scale-105",
              isHighlighted && "border-acento-fuerte/50 bg-acento-fuerte/5 shadow-soft"
            )}
            onMouseEnter={() => setHighlightedStatus(item.status)}
            onMouseLeave={() => setHighlightedStatus(null)}
          >
            <div className={cn("p-1 rounded-md", item.colorClasses)}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-primario-oscuro">
              {item.label} ({item.count})
            </span>
          </div>
        );
      })}
    </div>
  );
}
