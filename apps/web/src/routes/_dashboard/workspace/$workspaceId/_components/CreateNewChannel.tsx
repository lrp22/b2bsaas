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
import { orpc, queryClient } from "@/utils/orpc";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query"; // 1. Import standard hook

const channelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export function CreateNewChannel({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { workspaceId } = useParams({
    from: "/_dashboard/workspace/$workspaceId",
  });

  // 2. Use useMutation with orpc options
  const { mutateAsync } = useMutation(
    orpc.channel.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Channel created");
        setOpen(false);

        queryClient.invalidateQueries({
          queryKey: orpc.channel.listByWorkspace.key({
            input: { workspaceId },
          }),
        });

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
    defaultValues: {
      name: "",
    },
    validators: {
      onChange: channelFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync({
          name: value.name,
          workspaceId: workspaceId,
        });
        form.reset();
      } catch (e) {
        // Error is handled in onError above
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <Plus className="size-4" />
          </Button>
        </DialogTrigger>
      )}

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
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. general"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </Field>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? "Creating..." : "Create Channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
