import { format } from "date-fns"

interface TimesheetEntry {
  date: string
  originalHours: string
  correctedHours: string
  reason: string
}

interface TimesheetData {
  employeeName: string
  employeeId: string
  department: string
  weekEnding: Date | undefined
  entries: TimesheetEntry[]
  supervisorName: string
  submissionDate: Date
}

export interface SavedVersion {
  id: string
  version: number
  data: TimesheetData
  savedAt: Date
  weekEnding: string
}

const STORAGE_KEY = "timesheet-versions"

export function saveVersion(data: TimesheetData): SavedVersion {
  const versions = getAllVersions()
  const weekEndingStr = data.weekEnding ? format(data.weekEnding, "yyyy-MM-dd") : "draft"

  // Find the highest version number for this week
  const weekVersions = versions.filter((v) => v.weekEnding === weekEndingStr)
  const nextVersion = weekVersions.length > 0 ? Math.max(...weekVersions.map((v) => v.version)) + 1 : 1

  const newVersion: SavedVersion = {
    id: `${weekEndingStr}-v${nextVersion}-${Date.now()}`,
    version: nextVersion,
    data: {
      ...data,
      submissionDate: new Date(),
    },
    savedAt: new Date(),
    weekEnding: weekEndingStr,
  }

  versions.push(newVersion)

  // Keep only last 50 versions to prevent storage overflow
  const trimmedVersions = versions.slice(-50)

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedVersions))
  }

  return newVersion
}

export function getAllVersions(): SavedVersion[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const versions = JSON.parse(stored)
    // Convert date strings back to Date objects
    return versions.map((v: any) => ({
      ...v,
      savedAt: new Date(v.savedAt),
      data: {
        ...v.data,
        weekEnding: v.data.weekEnding ? new Date(v.data.weekEnding) : undefined,
        submissionDate: new Date(v.data.submissionDate),
      },
    }))
  } catch (error) {
    console.error("Error loading versions:", error)
    return []
  }
}

export function getVersionById(id: string): SavedVersion | null {
  const versions = getAllVersions()
  return versions.find((v) => v.id === id) || null
}

export function deleteVersion(id: string): void {
  const versions = getAllVersions()
  const filtered = versions.filter((v) => v.id !== id)

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  }
}

export function getVersionsByWeek(weekEnding: string): SavedVersion[] {
  const versions = getAllVersions()
  return versions.filter((v) => v.weekEnding === weekEnding).sort((a, b) => b.version - a.version)
}
