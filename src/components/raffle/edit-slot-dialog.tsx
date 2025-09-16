'use client';

import { useFormStatus } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { RaffleSlot } from "@/lib/definitions";
import { updateSlotAction } from "@/app/actions";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save Changes
    </Button>
  );
}

type EditSlotDialogProps = {
  children: React.ReactNode;
  slot: RaffleSlot;
  raffleId: string;
};

export default function EditSlotDialog({ children, slot, raffleId }: EditSlotDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleFormAction = async (formData: FormData) => {
    try {
        await updateSlotAction(formData);
        setOpen(false);
        toast({
            title: "Slot Updated",
            description: `Slot #${slot.slotNumber} has been successfully updated.`,
        });
    } catch(error) {
        toast({
            title: "Error",
            description: "Failed to update the slot. Please try again.",
            variant: "destructive"
        })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Slot #{slot.slotNumber}</DialogTitle>
          <DialogDescription>
            Update the participant's name and payment status for this slot.
          </DialogDescription>
        </DialogHeader>
        <form action={handleFormAction}>
            <input type="hidden" name="raffleId" value={raffleId} />
            <input type="hidden" name="slotNumber" value={slot.slotNumber} />
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="participantName" className="text-right">
                    Name
                    </Label>
                    <Input
                    id="participantName"
                    name="participantName"
                    defaultValue={slot.participantName}
                    className="col-span-3"
                    />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Status</Label>
                    <RadioGroup name="status" defaultValue={slot.status} className="col-span-3 pt-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="available" id="s-available" />
                            <Label htmlFor="s-available">Available</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="reserved" id="s-reserved" />
                            <Label htmlFor="s-reserved">Reserved</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="paid" id="s-paid" />
                            <Label htmlFor="s-paid">Paid</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
