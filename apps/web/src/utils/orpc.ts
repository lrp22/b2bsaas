import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import {
  QueryCache,
  QueryClient,
  defaultShouldDehydrateQuery, // Import dehydrate function
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { AppRouterClient } from "@b2bsaas/api/routers/index";
import { serializer } from "@/lib/serializer"; // Import your custom serializer

// This is now the ONE AND ONLY QueryClient for the entire application.
export const queryClient = new QueryClient({
  // Add the queryCache with your toast error handler
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "Retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
  // Add the defaultOptions from your old hydration client.
  // This keeps the advanced serialization in place, which is good practice.
  defaultOptions: {
    queries: {
      queryKeyHashFn(queryKey) {
        const [json, meta] = serializer.serialize(queryKey);
        return JSON.stringify({ json, meta });
      },
      staleTime: 60 * 1000,
    },
    dehydrate: {
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      serializeData(data) {
        const [json, meta] = serializer.serialize(data);
        return { json, meta };
      },
    },
    hydrate: {
      deserializeData(data) {
        return serializer.deserialize(data.json, data.meta);
      },
    },
  },
});

export const link = new RPCLink({
  url: `${import.meta.env.VITE_SERVER_URL}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
