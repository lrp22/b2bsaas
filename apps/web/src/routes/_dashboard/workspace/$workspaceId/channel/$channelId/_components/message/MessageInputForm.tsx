import { useForm } from "@tanstack/react-form";
import { orpc, queryClient } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { MessageComposer } from "./MessageComposer";
import { toast } from "sonner";

export function MessageInputForm() {
  const { workspaceId, channelId } = useParams({
    from: "/_dashboard/workspace/$workspaceId/channel/$channelId/",
  });

  const { mutateAsync, isPending } = useMutation(
    orpc.message.create.mutationOptions({
      onSuccess: () => {
        // Invalidate queries to refetch the list
        // Fuzzy matching works here: invalidating { channelId } will catch { channelId, limit: 20 }
        queryClient.invalidateQueries({
          queryKey: orpc.message.list.key({ input: { channelId } }),
        });
      },
      onError: (error: Error) => {
        toast.error("Failed to send message: " + error.message);
      },
    })
  );

  const form = useForm({
    defaultValues: {
      content: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.content || value.content.trim() === "") return;

      try {
        await mutateAsync({
          content: value.content,
          channelId,
          workspaceId,
        });
        form.reset();
      } catch (e) {
        console.error(e);
      }
    },
  });

  return (
    <div className="p-4 bg-background border-t">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="content"
          children={(field) => (
            <MessageComposer
              value={field.state.value}
              onChange={field.handleChange}
              onSubmit={form.handleSubmit}
              isPending={isPending}
            />
          )}
        />
      </form>
    </div>
  );
}
