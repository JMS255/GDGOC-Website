import { DEPARTMENTS, type Department } from "@/lib/types"

interface DepartmentInfo {
  label: string
  description: string
  skills: string[]
}

export const DEPARTMENT_INFO: Record<Department, DepartmentInfo> = {
  Events: {
    label: "Organizing Events & Hosting",
    description: "Plans and runs GDGoC events end-to-end — from setup to standing on stage.",
    skills: [
      "Emcee / Hosting",
      "Event Logistics & Setup",
      "Guest / Speaker Coordination",
      "On-site Coordination",
    ],
  },
  Creatives: {
    label: "UI/UX & Graphic Design",
    description: "Designs everything members and the public actually see — posters, decks, the app itself.",
    skills: ["Graphic Design", "UI/UX Design", "Video Editing", "Photography"],
  },
  "Tech & Docu": {
    label: "Coding & App Dev",
    description: "Builds and documents the technical projects GDGoC ships.",
    skills: ["Web Development", "Mobile Development", "Backend / Database", "Technical Writing / Documentation"],
  },
  "PR & Marketing": {
    label: "Writing & Social Media",
    description: "Writes and posts the content that gets people to actually show up.",
    skills: ["Content Writing", "Social Media Management", "Copywriting", "Community Engagement"],
  },
  Finance: {
    label: "Budgets & Money Management",
    description: "Keeps the org's money honest — budgets, sponsorships, and receipts.",
    skills: ["Budgeting", "Sponsorship & Fundraising", "Bookkeeping"],
  },
}

export const ALL_SKILLS = DEPARTMENTS.flatMap((dept) => DEPARTMENT_INFO[dept].skills)
