import { users } from './users-store'

/* Read-only list for "Profil Desa" (people with access to a village) */
export function usersForVillage(villageId: string) {
  return users
    .get()
    .flatMap((u) => u.roles.filter((r) => r.villageId === villageId).map((r) => ({ name: u.name, email: u.email, status: u.status, role: r })))
}
