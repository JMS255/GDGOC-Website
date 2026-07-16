export type Role = "chief_exec" | "system_admin" | "department_head" | "committee" | "member"
export const ALL_ROLES: Role[] = ["chief_exec", "system_admin", "department_head", "committee", "member"]

// Role reassignment is Chief Exec only — the one thing System Admin can't
// do, per the deliberate boundary set for that role (full operational
// access otherwise, but final organizational authority stays with Chief Exec).
export const CHIEF_EXEC_ONLY: Role[] = ["chief_exec"]

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

export type ResponsibilityStatus = "assigned" | "done" | "missed"

export interface ResponsibilityRecord {
  id: string
  assignedTo: string
  assignedBy: string
  title: string
  dueDate: Date | null
  status: ResponsibilityStatus
  createdAt: Date
}

export interface PerformanceReviewRecord {
  id: string
  uid: string
  termId: string
  reviewedBy: string
  rating: number
  note: string
  createdAt: Date
}

export interface ProductRecord {
  id: string
  name: string
  description: string
  imageURL: string | null
  price: number
  variants: string[]
  isActive: boolean
}

export type MerchOrderStatus = "pending" | "approved" | "rejected" | "fulfilled"

export interface MerchOrderRecord {
  id: string
  buyerName: string
  buyerContact: string
  productId: string
  productName: string
  variant: string | null
  quantity: number
  totalAmount: number
  proofImageURL: string
  status: MerchOrderStatus
  createdAt: Date
}

// Fixed department set — an applicant's selected interests are department
// names directly, so routing an application to the right Department Head's
// queue is just `interests.includes(user.department)`, no separate mapping.
export const DEPARTMENTS = [
  "Creative",
  "Tech & Docu",
  "Events",
  "Logistics",
  "Finance",
  "PR/Marketing",
] as const
export type Department = (typeof DEPARTMENTS)[number]

export type ApplicationStatus = "new" | "approved" | "rejected" | "converted"

export interface ApplicationRecord {
  id: string
  fullName: string
  email: string
  studentId: string
  course: string
  yearLevel: number
  contactNumber: string
  interests: string[]
  skills: string[]
  status: ApplicationStatus
  interviewNotes: string
  rating: number | null
  convertedUid: string | null
  createdAt: Date
}

export interface AnnouncementRecord {
  id: string
  title: string
  body: string
  createdAt: Date
}

export interface OrgKpiRecord {
  id: string
  label: string
  value: string
}
