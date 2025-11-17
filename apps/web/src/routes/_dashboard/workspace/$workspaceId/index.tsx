import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/workspace/$workspaceId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/workspace/$workspaceId/"!</div>
}
