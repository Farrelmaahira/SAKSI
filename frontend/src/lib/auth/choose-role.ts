import { startSession } from "./start-session";
import { users } from "./users-store";

/* Called after login when the user has more than one user_roles row */
export function chooseRole(userId: string, roleId: string) {
  const u = users.get().find((x) => x.id === userId);
  const role = u?.roles.find((r) => r.id === roleId);
  if (u && role) startSession(u, role);
}
