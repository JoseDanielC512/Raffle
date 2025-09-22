import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RaffleTermsCardProps = {
  terms: string;
};

export default function RaffleTermsCard({ terms }: RaffleTermsCardProps) {
  return (
    <Card className="flex flex-col bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="bg-muted/30 rounded-t-lg border-b border-border/50 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          Términos y Condiciones
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-grow max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-muted/10">
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed tracking-tight">
          {terms}
        </p>
      </CardContent>
    </Card>
  );
}
