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
    // FIX 1: Change 'messages' to 'message' to match your API router definition
    orpc.message.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          // FIX 1: Change 'messages' to 'message' here as well
          queryKey: orpc.message.list.key({ input: { channelId } }),
        });
      },
      // FIX 2: Explicitly type the error
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
        // Now that the router path is correct, this input will match the type definition
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
    <div className="p-4 bg-background">
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
