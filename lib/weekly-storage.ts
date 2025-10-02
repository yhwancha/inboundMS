import { format, endOfWeek } from "date-fns"
import type { TimesheetData, Adjustment, WeeklySubmission } from "./types"

const CURRENT_WEEK_KEY = "current-week-adjustments"
const SUBMISSIONS_KEY = "weekly-submissions"
const EMPLOYEE_INFO_KEY = "employee-info"

// Get the current week's date range
export function getCurrentWeekEnding(): Date {
  return endOfWeek(new Date(), { weekStartsOn: 1 }) // Week starts on Monday
}

export function getCurrentWeekKey(): string {
  return format(getCurrentWeekEnding(), "yyyy-MM-dd")
}

// Save employee info for reuse
export function saveEmployeeInfo(info: {
  employeeName: string
  employeeNumber: string
  department: string
  supervisorName: string
}) {
  if (typeof window !== "undefined") {
    localStorage.setItem(EMPLOYEE_INFO_KEY, JSON.stringify(info))
  }
}

export function getEmployeeInfo() {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(EMPLOYEE_INFO_KEY)
  return stored ? JSON.parse(stored) : null
}

// Current week adjustments
export function getCurrentWeekAdjustments(): Adjustment[] {
  if (typeof window === "undefined") return []

  const currentWeekKey = getCurrentWeekKey()
  const stored = localStorage.getItem(CURRENT_WEEK_KEY)
  
  if (!stored) return []

  try {
    const data = JSON.parse(stored)
    
    // Check if the stored data is for the current week
    if (data.weekEnding !== currentWeekKey) {
      // Week has changed, clear old data and return empty array
      clearCurrentWeek()
      return []
    }
    
    return data.adjustments || []
  } catch (error) {
    console.error("Error loading current week adjustments:", error)
    return []
  }
}

export function addAdjustment(adjustment: Omit<Adjustment, "id">): Adjustment {
  const adjustments = getCurrentWeekAdjustments()
  const newAdjustment: Adjustment = {
    ...adjustment,
    id: `adj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }

  adjustments.push(newAdjustment)

  if (typeof window !== "undefined") {
    const weekKey = getCurrentWeekKey()
    localStorage.setItem(
      CURRENT_WEEK_KEY,
      JSON.stringify({
        weekEnding: weekKey,
        adjustments,
      }),
    )
    console.log(`Added adjustment for week ${weekKey}:`, newAdjustment)
  }

  return newAdjustment
}

export function deleteAdjustment(id: string) {
  const adjustments = getCurrentWeekAdjustments()
  const filtered = adjustments.filter((adj) => adj.id !== id)

  if (typeof window !== "undefined") {
    localStorage.setItem(
      CURRENT_WEEK_KEY,
      JSON.stringify({
        weekEnding: getCurrentWeekKey(),
        adjustments: filtered,
      }),
    )
  }
}

export function clearCurrentWeek() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CURRENT_WEEK_KEY)
  }
}

// Weekly submissions
export function submitWeeklyTimesheet(data: TimesheetData): WeeklySubmission {
  const submissions = getAllSubmissions()

  const submission: WeeklySubmission = {
    id: `sub-${Date.now()}`,
    weekEnding: format(data.weekEnding, "yyyy-MM-dd"),
    data: {
      ...data,
      submittedAt: new Date(),
    },
    submittedAt: new Date(),
  }

  submissions.push(submission)

  if (typeof window !== "undefined") {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions))
  }

  // Clear current week after submission
  clearCurrentWeek()

  return submission
}

export function getAllSubmissions(): WeeklySubmission[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(SUBMISSIONS_KEY)
    if (!stored) return []

    const submissions = JSON.parse(stored)
    return submissions.map((s: any) => ({
      ...s,
      submittedAt: new Date(s.submittedAt),
      data: {
        ...s.data,
        weekEnding: new Date(s.data.weekEnding),
        submittedAt: s.data.submittedAt ? new Date(s.data.submittedAt) : undefined,
      },
    }))
  } catch (error) {
    console.error("Error loading submissions:", error)
    return []
  }
}

export function getSubmissionById(id: string): WeeklySubmission | null {
  const submissions = getAllSubmissions()
  return submissions.find((s) => s.id === id) || null
}

export function deleteSubmission(id: string) {
  const submissions = getAllSubmissions()
  const filtered = submissions.filter((s) => s.id !== id)

  if (typeof window !== "undefined") {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(filtered))
  }
}
