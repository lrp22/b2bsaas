import { useForm } from "@tanstack/react-form";
import { orpc, queryClient } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
// FIXED: Ensure this file exists in the same directory
import { MessageComposer } from "./MessageComposer";
import { toast } from "sonner";

export function MessageInputForm() {
  // FIXED: Added trailing slash to match strict router types
  const { channelId } = useParams({
    from: "/_dashboard/workspace/$workspaceId/channel/$channelId/",
  });

  const createMessage = useMutation(
    orpc.message.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.message.list.key({ input: { channelId } }),
        });
      },
      onError: (err) => {
        toast.error("Failed to send message");
        console.error(err);
      },
    })
  );

  const form = useForm({
    defaultValues: {
      content: "",
    },
    onSubmit: async ({ value, formApi }) => {
      if (!value.content || value.content === "{}") return;

      try {
        await createMessage.mutateAsync({
          channelId,
          content: value.content,
        });
        // Reset form after success
        formApi.reset();
      } catch (e) {
        // Error handled in mutation options
      }
    },
  });

  return (
    <div className="p-4 pt-2">
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
              isPending={createMessage.isPending}
            />
          )}
        />
      </form>
    </div>
  );
}
