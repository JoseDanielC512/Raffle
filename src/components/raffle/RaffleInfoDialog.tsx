import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, ScrollText, Info, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

type RaffleInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terms: string;
  winnerName?: string;
  winnerSlotNumber?: number;
  isFinalized: boolean;
};

export default function RaffleInfoDialog({
  open,
  onOpenChange,
  terms,
  winnerName,
  winnerSlotNumber,
  isFinalized,
}: RaffleInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] p-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col h-full"
        >
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-primary/90 via-primary/80 to-accent/90 p-6 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Detalles de la Rifa
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/80">
                Toda la información que necesitas saber.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Tabs Content */}
          <div className="flex-grow overflow-y-auto">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Información
                </TabsTrigger>
                <TabsTrigger value="terms" className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4" />
                  Términos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="m-4 space-y-4">
                <Card className="border-border/60 shadow-sm">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Casillas totales:</span>
                      <Badge variant="secondary" className="font-mono">100</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estado:</span>
                      <Badge variant={isFinalized ? "destructive" : "default"}>
                        {isFinalized ? "Finalizada" : "Activa"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Creada por:</span>
                      <span className="font-medium text-foreground">Organizador</span>
                    </div>
                  </CardContent>
                </Card>

                {isFinalized && winnerName && winnerSlotNumber && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50/30 to-amber-100/20 shadow-lg overflow-hidden">
                      <CardContent className="pt-6">
                        <div className="text-center space-y-3">
                          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-lg">
                            <Crown className="h-8 w-8 text-amber-100" />
                          </div>
                          <h3 className="text-xl font-bold text-amber-800">¡Tenemos un Ganador!</h3>
                          <p className="text-amber-700">
                            <span className="font-semibold">Slot Ganador:</span>
                            <Badge variant="outline" className="ml-2 border-amber-400 text-amber-800 font-mono text-lg">
                              #{winnerSlotNumber}
                            </Badge>
                          </p>
                          <p className="text-lg font-medium text-amber-900">
                            Ganador: <span className="font-bold">{winnerName}</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="terms" className="m-4">
                <Card className="border-border/60 shadow-sm">
                  <CardContent className="pt-6">
                    <ScrollArea className="h-[300px] w-full rounded-md border border-border p-4">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {terms}
                      </p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
