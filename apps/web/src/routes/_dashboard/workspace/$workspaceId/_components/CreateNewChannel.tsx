import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { orpc, queryClient } from "@/utils/orpc";

// --- Form logic can live inside this component file ---
const createChannelSchema = z.object({
  name: z.string().min(2, "Channel name must be at least 2 characters."),
});

function CreateChannelForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const createChannel = useMutation(
    orpc.channel.create.mutationOptions({
      onSuccess: () => {
        toast.success("Channel created!");
        queryClient.invalidateQueries({
          queryKey: orpc.channel.listByWorkspace.queryOptions().queryKey,
        });
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create channel.");
      },
    })
  );

  const form = useForm({
    defaultValues: { name: "" },
    validators: { onChange: createChannelSchema },
    onSubmit: async ({ value }) => {
      createChannel.mutate({ name: value.name });
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        children={(field) => (
          <Field>
            <FieldLabel>Channel Name</FieldLabel>
            <Input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. product-updates"
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      />
      <Button type="submit" disabled={createChannel.isPending}>
        {createChannel.isPending ? "Creating..." : "Create Channel"}
      </Button>
    </form>
  );
}

// --- This is the main, self-contained component ---
export function CreateNewChannel() {
  const [isOpen, setOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Create Channel</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new channel</DialogTitle>
        </DialogHeader>
        <CreateChannelForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
