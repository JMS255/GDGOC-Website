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

// Committee ("Event Support") members otherwise have zero dashboard access —
// this is the one read-only exception, for verifying membership (e.g. at an
// event door) without needing the full admin dashboard.
export const COMMITTEE_OR_ABOVE: Role[] = [
  "chief_exec",
  "system_admin",
  "department_head",
  "committee",
]

// Term creation/activation is org-wide policy, not a per-department action —
// scoped to chief_exec/system_admin only, same boundary as orgKpis.
export const TERM_MANAGERS: Role[] = ["chief_exec", "system_admin"]

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

export type PaymentProofStatus = "pending" | "approved" | "rejected"

export interface PaymentProofRecord {
  id: string
  uid: string
  memberName: string
  imageURL: string
  amount: number | null
  status: PaymentProofStatus
  submittedAt: Date
}

export interface MembershipTermRecord {
  id: string
  label: string
  startDate: Date
  endDate: Date
  isActive: boolean
}

export type RenewalStatus = "pending" | "approved" | "rejected"

export interface MembershipRenewalRecord {
  id: string
  uid: string
  termId: string
  tier: MembershipTier
  status: RenewalStatus
}
