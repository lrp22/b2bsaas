import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { useState } from "react";

export function CreateWorkspace() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipContent>
          <TooltipTrigger>
            <DialogTrigger>
              <Button variant="ghost" size="icon">
                <Plus className="size-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
        </TooltipContent>
      </Tooltip>
    </Dialog>
  );
}
