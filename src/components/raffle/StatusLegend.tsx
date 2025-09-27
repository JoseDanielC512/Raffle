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
      colorClasses: "bg-gradient-to-br from-sage-500 to-sage-600 text-battleship_gray-100",
    },
    {
      status: "reserved",
      label: "Reservadas",
      count: reservedSlots,
      icon: Clock,
      colorClasses: "bg-gradient-to-br from-yellow-500 to-yellow-600 text-battleship_gray-100",
    },
    {
      status: "paid",
      label: "Pagadas",
      count: paidSlots,
      icon: CheckCircle,
      colorClasses: "bg-gradient-to-br from-ultra_violet-500 to-ultra_violet-600 text-battleship_gray-100",
    },
    {
      status: "winner", // Este estado es especial y no viene de los props de conteo
      label: "Ganadora",
      count: 1, // Siempre habrá una ganadora al finalizar
      icon: Crown,
      colorClasses: "bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900",
    },
  ];

  return (
    <div className="flex justify-center items-center gap-4 md:gap-6 mt-6 pt-4 border-t border-battleship_gray-300 dark:border-battleship_gray-700 flex-wrap">
      {legendItems.map((item) => {
        const Icon = item.icon;
        const isHighlighted = highlightedStatus === item.status;
        return (
          <div
            key={item.status}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 border-2 border-transparent",
              isHighlighted && "border-ultra_violet-500/50 bg-ultra_violet-500/5 shadow-sm"
            )}
            onMouseEnter={() => setHighlightedStatus(item.status)}
            onMouseLeave={() => setHighlightedStatus(null)}
          >
            <div className={cn("p-1 rounded-md", item.colorClasses)}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-battleship_gray-600 dark:text-battleship_gray-400">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
