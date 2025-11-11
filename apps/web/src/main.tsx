// apps/web/src/main.tsx

import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";

import { QueryClientProvider } from "@tanstack/react-query";
import { orpc } from "./utils/orpc";
// 1. Import your new hydration-aware client creator
import { createQueryClient } from "./lib/query/client";

// 2. Create the single, top-level queryClient instance here
const queryClient = createQueryClient();

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: () => <Loader />,
  // 3. Provide this instance to the router's context
  context: { orpc, queryClient },
  // 4. Use the official TanStack Router 'Wrap' component
  // This ensures the entire app is wrapped correctly from the very top.
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
