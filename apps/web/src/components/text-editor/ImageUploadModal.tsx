import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (url: string) => void;
}

export function ImageUploadModal({
  isOpen,
  onOpenChange,
  onUploaded,
}: ImageUploadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-md bg-muted/10">
          <p className="text-muted-foreground text-sm">
            Image upload not implemented yet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
