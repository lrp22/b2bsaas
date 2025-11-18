import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { orpc, queryClient } from "@/utils/orpc";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";

const createChannelSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// ADDED: trigger prop
export function CreateNewChannel({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { workspaceId } = useParams({
    from: "/_dashboard/workspace/$workspaceId",
  });
  const navigate = useNavigate();

  const createChannel = useMutation(
    orpc.channel.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: orpc.channel.listByWorkspace.key({
            input: { workspaceId },
          }),
        });
        toast.success("Channel created");
        setOpen(false);
        navigate({
          to: "/workspace/$workspaceId/channel/$channelId",
          params: { workspaceId, channelId: data.id },
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useForm({
    defaultValues: { name: "" },
    validators: { onChange: createChannelSchema },
    onSubmit: async ({ value }) => {
      await createChannel.mutateAsync({ name: value.name });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Use custom trigger if provided, otherwise default sidebar button */}
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground hover:text-foreground bg-background/50 border-dashed"
          >
            <Plus className="mr-2 size-4" />
            Add Channel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            children={(field) => (
              <Field>
                <FieldLabel>Channel Name</FieldLabel>
                <Input
                  placeholder="e.g. marketing"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-destructive mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </Field>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={createChannel.isPending}>
              {createChannel.isPending ? "Creating..." : "Create Channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
