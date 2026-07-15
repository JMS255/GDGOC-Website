export type Role = "chief_exec" | "system_admin" | "department_head" | "committee" | "member"

export type MembershipStatus = "pending" | "active" | "expired" | "rejected"

export type MembershipTier = "free" | "paid"

export interface UserRecord {
  uid: string
  email: string
  displayName: string | null
  role: Role
  department: string | null
  membershipStatus: MembershipStatus
  membershipTier: MembershipTier
}

export const DEPT_HEAD_OR_ABOVE: Role[] = ["chief_exec", "system_admin", "department_head"]

export function isDeptHeadOrAbove(role: Role): boolean {
  return DEPT_HEAD_OR_ABOVE.includes(role)
}

export type EventStatus = "draft" | "published" | "completed" | "cancelled"

export interface EventRecord {
  id: string
  title: string
  description: string
  department: string
  startsAt: Date
  endsAt: Date
  location: string
  status: EventStatus
}

export interface RsvpRecord {
  id: string
  eventId: string
  uid: string
  attended: boolean
}
