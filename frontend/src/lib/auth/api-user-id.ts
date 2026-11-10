/* Session ids of API logins are "u-<users.id>"; anything else (local demo account) has no server id. */
export const apiUserId = (sessionUserId: string) => (/^u-\d+$/.test(sessionUserId) ? Number(sessionUserId.slice(2)) : 0)
