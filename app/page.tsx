"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Download, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { generateTimesheetPDF, downloadPDF } from "@/lib/pdf-generator"
import { useToast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/date-picker"
import {
  getCurrentWeekAdjustments,
  addAdjustment,
  deleteAdjustment,
  getCurrentWeekEnding,
  saveEmployeeInfo,
  getEmployeeInfo,
  submitWeeklyTimesheet,
} from "@/lib/weekly-storage"
import type { Adjustment, TimesheetData } from "@/lib/types"

export default function Home() {
  const { toast } = useToast()
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [employeeName, setEmployeeName] = useState("")
  const [employeeNumber, setEmployeeNumber] = useState("")
  const [department, setDepartment] = useState("")
  const [supervisorName, setSupervisorName] = useState("")
  const [remarks, setRemarks] = useState("")

  const [newAdj, setNewAdj] = useState<{
    date: Date | undefined
    clockIn: string
    mealOut: string
    mealReturn: string
    clockOut: string
    reason: string
  }>({
    date: undefined,
    clockIn: "",
    mealOut: "",
    mealReturn: "",
    clockOut: "",
    reason: "",
  })

  useEffect(() => {
    // Load current week adjustments
    loadCurrentWeekData()

    // Load saved employee info
    const savedInfo = getEmployeeInfo()
    if (savedInfo) {
      setEmployeeName(savedInfo.employeeName || "")
      setEmployeeNumber(savedInfo.employeeNumber || "")
      setDepartment(savedInfo.department || "")
      setSupervisorName(savedInfo.supervisorName || "")
    }
  }, [])

  const loadCurrentWeekData = () => {
    const savedAdjustments = getCurrentWeekAdjustments()
    setAdjustments(savedAdjustments)
    
    // Show toast if week has changed
    const currentWeekEnding = getCurrentWeekEnding()
    const weekKey = format(currentWeekEnding, "yyyy-MM-dd")
    const stored = localStorage.getItem("current-week-adjustments")
    
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.weekEnding && data.weekEnding !== weekKey) {
          toast({
            title: "New Week Started",
            description: `Previous week's data has been saved. You can now add adjustments for the week ending ${format(currentWeekEnding, "MMMM dd, yyyy")}.`,
          })
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
  }

  const handleAddAdjustment = () => {
    if (!newAdj.date) {
      toast({
        title: "Date Required",
        description: "Please select a date for the adjustment.",
        variant: "destructive",
      })
      return
    }

    addAdjustment({
      ...newAdj,
      date: format(newAdj.date, "yyyy-MM-dd"),
    })
    
    // Reload current week data
    loadCurrentWeekData()

    // Clear form
    setNewAdj({
      date: undefined,
      clockIn: "",
      mealOut: "",
      mealReturn: "",
      clockOut: "",
      reason: "",
    })

    toast({
      title: "Adjustment Added",
      description: "Time adjustment has been added to this week.",
    })
  }

  const handleDeleteAdjustment = (id: string) => {
    deleteAdjustment(id)
    
    // Reload current week data
    loadCurrentWeekData()

    toast({
      title: "Adjustment Deleted",
      description: "Time adjustment has been removed.",
    })
  }

  const handleDownloadPDF = async () => {
    // Save employee info for next time
    saveEmployeeInfo({
      employeeName,
      employeeNumber,
      department,
      supervisorName,
    })

    const timesheetData: TimesheetData = {
      employeeName,
      employeeNumber,
      department,
      supervisorName,
      remarks,
      adjustments,
      weekEnding: getCurrentWeekEnding(),
      submittedAt: new Date(),
    }

    try {
      const pdf = await generateTimesheetPDF(timesheetData)
      const filename = `timesheet-correction-${format(getCurrentWeekEnding(), "yyyy-MM-dd")}.pdf`
      downloadPDF(pdf, filename)

      // Save submission
      submitWeeklyTimesheet(timesheetData)

      // Reload current week data (will be empty after submission)
      loadCurrentWeekData()
      setRemarks("")

      toast({
        title: "PDF Downloaded",
        description: "Your timesheet has been downloaded and saved to history.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Timesheet Correction Form</h1>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-muted-foreground">Week Ending: {format(getCurrentWeekEnding(), "MMMM dd, yyyy")}</p>
          <div className="text-sm text-muted-foreground">
            {adjustments.length} adjustment{adjustments.length !== 1 ? 's' : ''} this week
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Adjustment</CardTitle>
          <CardDescription>Add time corrections one at a time throughout the week</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker
                date={newAdj.date}
                onDateChange={(date) => setNewAdj({ ...newAdj, date })}
                placeholder="Select date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clockIn">Clock In</Label>
              <Input
                id="clockIn"
                type="time"
                value={newAdj.clockIn}
                onChange={(e) => setNewAdj({ ...newAdj, clockIn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mealOut">Meal Out</Label>
              <Input
                id="mealOut"
                type="time"
                value={newAdj.mealOut}
                onChange={(e) => setNewAdj({ ...newAdj, mealOut: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mealReturn">Meal Return</Label>
              <Input
                id="mealReturn"
                type="time"
                value={newAdj.mealReturn}
                onChange={(e) => setNewAdj({ ...newAdj, mealReturn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clockOut">Clock Out</Label>
              <Input
                id="clockOut"
                type="time"
                value={newAdj.clockOut}
                onChange={(e) => setNewAdj({ ...newAdj, clockOut: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Explain the reason for this correction..."
              value={newAdj.reason}
              onChange={(e) => setNewAdj({ ...newAdj, reason: e.target.value })}
              rows={2}
            />
          </div>
          <Button onClick={handleAddAdjustment} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Adjustment
          </Button>
        </CardContent>
      </Card>

      {adjustments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>This Week's Adjustments ({adjustments.length})</CardTitle>
            <CardDescription>Review adjustments before downloading PDF</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adjustments.map((adj) => (
                <div key={adj.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <div className="font-medium text-muted-foreground">Date</div>
                      <div>{adj.date}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Clock In</div>
                      <div>{adj.clockIn || "-"}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Meal Out</div>
                      <div>{adj.mealOut || "-"}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Meal Return</div>
                      <div>{adj.mealReturn || "-"}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Clock Out</div>
                      <div>{adj.clockOut || "-"}</div>
                    </div>
                    <div className="col-span-2 md:col-span-5">
                      <div className="font-medium text-muted-foreground">Reason</div>
                      <div className="text-foreground">{adj.reason}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAdjustment(adj.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>This information will be saved for future use</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Name</Label>
              <Input
                id="employeeName"
                placeholder="John Doe"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeNumber">Employee #</Label>
              <Input
                id="employeeNumber"
                placeholder="12345"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Dept.</Label>
              <Input
                id="department"
                placeholder="Logistics"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisorName">Supervisor Name</Label>
              <Input
                id="supervisorName"
                placeholder="Jane Smith"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Remarks</CardTitle>
          <CardDescription>Optional additional notes</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any additional remarks or notes..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      <Button
        onClick={handleDownloadPDF}
        size="lg"
        className="w-full"
        disabled={adjustments.length === 0 || !employeeName || !employeeNumber}
      >
        <Download className="mr-2 h-4 w-4" />
        Download PDF & Submit
      </Button>
    </div>
  )
}
