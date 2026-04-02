import { PlusIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
}

export function AvatarGroupCountIconExample({ users = [] }: { users: User[] }) {
  const maxVisible = 3;

  const visibleUsers = users.slice(0, maxVisible);
  const remaining = users.length - maxVisible;

  return (
    <AvatarGroup className="">
      {visibleUsers.map((user) => (
        <Avatar key={user.id}>
          <AvatarImage src={user.image || ""} alt={user.name || "User"} />
          <AvatarFallback>
            {user.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "U"}
          </AvatarFallback>
        </Avatar>
      ))}

      {remaining > 0 && (
        <AvatarGroupCount>
          <PlusIcon className="mr-1" />
          {remaining}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}