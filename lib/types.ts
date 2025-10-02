export interface Adjustment {
  id: string
  date: string
  clockIn: string
  mealOut: string
  mealReturn: string
  clockOut: string
  reason: string
}

export interface TimesheetData {
  employeeName: string
  employeeNumber: string
  department: string
  supervisorName: string
  remarks: string
  adjustments: Adjustment[]
  weekEnding: Date
  submittedAt?: Date
}

export interface WeeklySubmission {
  id: string
  weekEnding: string
  data: TimesheetData
  submittedAt: Date
}
