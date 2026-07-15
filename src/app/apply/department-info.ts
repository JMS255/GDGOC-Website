import { DEPARTMENTS, type Department } from "@/lib/types"

interface DepartmentInfo {
  label: string
  description: string
  skills: string[]
}

export const DEPARTMENT_INFO: Record<Department, DepartmentInfo> = {
  Creative: {
    label: "UI/UX & Graphic Design",
    description: "Designs everything members and the public actually see — posters, decks, the app itself.",
    skills: ["Graphic Design", "UI/UX Design", "Video Editing", "Photography"],
  },
  "Tech & Docu": {
    label: "Coding & App Dev",
    description: "Builds and documents the technical projects GDGoC ships.",
    skills: ["Web Development", "Mobile Development", "Backend / Database", "Technical Writing / Documentation"],
  },
  Events: {
    label: "Organizing Events & Hosting",
    description: "Plans and runs GDGoC events end-to-end — from the program to standing on stage.",
    skills: ["Emcee / Hosting", "Guest / Speaker Coordination", "Program Flow / Timekeeping"],
  },
  Logistics: {
    label: "Operations & Setup",
    description: "Handles the behind-the-scenes physical work — procurement, equipment, and venue setup for every event.",
    skills: [
      "Procurement & Sourcing",
      "Equipment & Venue Setup",
      "Transportation Coordination",
      "Inventory Management",
    ],
  },
  Finance: {
    label: "Budgets & Money Management",
    description: "Keeps the org's money honest — budgets, sponsorships, and receipts.",
    skills: ["Budgeting", "Sponsorship & Fundraising", "Bookkeeping"],
  },
  "PR/Marketing": {
    label: "Writing & Social Media",
    description: "Writes and posts the content that gets people to actually show up.",
    skills: ["Content Writing", "Social Media Management", "Copywriting", "Community Engagement"],
  },
}

export const ALL_SKILLS = DEPARTMENTS.flatMap((dept) => DEPARTMENT_INFO[dept].skills)

export const COURSES = [
  "BSCS - Computer Science",
  "BSIT - Information Technology",
  "BSA - Accountancy",
  "BSBA - Business Administration",
  "BSN - Nursing",
  "BSMT - Marine Transportation",
  "BSCE - Civil Engineering",
  "BSED - Secondary Education",
  "BEED - Elementary Education",
  "Other",
]

export const YEAR_LEVELS = [
  { value: 1, label: "1st Year" },
  { value: 2, label: "2nd Year" },
  { value: 3, label: "3rd Year" },
  { value: 4, label: "4th Year" },
  { value: 5, label: "5th Year" },
]
