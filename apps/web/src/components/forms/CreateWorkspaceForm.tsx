import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";

import { useMutation } from "@tanstack/react-query";
import { orpc, queryClient } from "@/utils/orpc";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// 1. SIMPLIFIED SCHEMA: We only need to validate the 'name' now.
const formSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters."),
});

export function CreateWorkspaceForm({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) {
  const createWorkspace = useMutation(
    orpc.workspace.create.mutationOptions({
      onSuccess: () => {
        toast.success("Workspace created successfully!");
        queryClient.invalidateQueries({
          queryKey: orpc.workspace.list.queryOptions().queryKey,
        });
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create workspace.");
      },
    })
  );

  const form = useForm({
    // 2. SIMPLIFIED DEFAULTS: Only 'name' is needed.
    defaultValues: {
      name: "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      // 3. SIMPLIFIED MUTATION: We only pass the name to the backend.
      createWorkspace.mutate({ name: value.name });
    },
  });

  return (
    <Card className="w-full sm:max-w-md border-0 shadow-none">
      <CardContent className="p-0">
        <form
          id="create-workspace-form"
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="name"
            children={(field) => {
              const isInvalid = field.state.meta.errors.length > 0;
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>Workspace Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    // The onChange is now simpler, no need to slugify.
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Acme Inc."
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {/* 4. REMOVED: The entire slug form field is gone. */}
        </form>
      </CardContent>
      <CardFooter className="px-0 pt-6">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              form="create-workspace-form"
              disabled={!canSubmit || isSubmitting || createWorkspace.isPending}
              className="w-full"
            >
              {createWorkspace.isPending ? "Creating..." : "Create Workspace"}
            </Button>
          )}
        />
      </CardFooter>
    </Card>
  );
}
