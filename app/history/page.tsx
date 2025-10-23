"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Trash2, FileText } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface TimesheetEntry {
  id: string
  date: string
  employeeName: string
  checkInTime: string
  checkOutTime: string
  location: string
  totalHours: number
  createdAt?: string
  updatedAt?: string
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<TimesheetEntry[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      const response = await fetch('/api/timesheet')
      const data = await response.json()
      setEntries(data.sort((a: TimesheetEntry, b: TimesheetEntry) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ))
    } catch (error) {
      console.error('Error loading timesheet entries:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/timesheet/${id}`, {
        method: 'DELETE'
      })
      
      await loadEntries()
      
      toast({
        title: "Entry Deleted",
        description: "The timesheet entry has been removed from history.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (entry: TimesheetEntry) => {
    try {
      // Create a simple CSV download
      const csvContent = `Date,Employee,Check In,Check Out,Location,Total Hours\n${entry.date},${entry.employeeName},${entry.checkInTime},${entry.checkOutTime},${entry.location},${entry.totalHours}`
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `timesheet-${entry.date}-${entry.employeeName}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "CSV Downloaded",
        description: `Timesheet for ${entry.date} has been downloaded.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download CSV.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Submission History</h1>
        <p className="text-muted-foreground mt-1">View and download previously submitted timesheets</p>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">
                No timesheet entries yet. Add your first timesheet to start tracking history.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Timesheet Entries</CardTitle>
            <CardDescription>
              {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          Date: {format(new Date(entry.date), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          Employee: {entry.employeeName}
                        </div>
                        <div>Location: {entry.location}</div>
                        <div>Check In: {entry.checkInTime} | Check Out: {entry.checkOutTime}</div>
                        <div>Total Hours: {entry.totalHours}</div>
                        {entry.createdAt && (
                          <div>Created: {format(new Date(entry.createdAt), "MMM dd, yyyy HH:mm")}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(entry)}
                        title="Download CSV"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                        title="Delete entry"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
