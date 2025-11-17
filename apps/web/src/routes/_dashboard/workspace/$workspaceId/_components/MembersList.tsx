import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MembersList() {
  // 1. Fetch data from our new 'members.listByWorkspace' endpoint.
  const { data: members, isLoading } = useQuery(
    orpc.members.listByWorkspace.queryOptions()
  );

  // 2. A loading state with skeletons shaped like a user list item.
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 3. An empty state if something went wrong or no members are found.
  if (!members || members.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground border-2 border-dashed rounded-md">
        <p>No members found in this workspace.</p>
      </div>
    );
  }

  // 4. Render the list of members.
  return (
    <div className="flex flex-col gap-4">
      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.image ?? undefined} alt={member.name} />
            <AvatarFallback>
              {member.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{member.name}</p>
            <p className="text-sm text-muted-foreground">{member.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
