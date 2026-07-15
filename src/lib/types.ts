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
