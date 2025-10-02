"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Trash2, FileText } from "lucide-react"
import { format } from "date-fns"
import { getAllSubmissions, deleteSubmission, type WeeklySubmission } from "@/lib/weekly-storage"
import { generateTimesheetPDF, downloadPDF } from "@/lib/pdf-generator"
import { useToast } from "@/hooks/use-toast"

export default function HistoryPage() {
  const [submissions, setSubmissions] = useState<WeeklySubmission[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = () => {
    const allSubmissions = getAllSubmissions()
    setSubmissions(allSubmissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()))
  }

  const handleDelete = (id: string) => {
    deleteSubmission(id)
    loadSubmissions()
    toast({
      title: "Submission Deleted",
      description: "The weekly submission has been removed from history.",
    })
  }

  const handleDownload = async (submission: WeeklySubmission) => {
    try {
      const pdf = await generateTimesheetPDF(submission.data)
      const filename = `timesheet-correction-${submission.weekEnding}.pdf`
      downloadPDF(pdf, filename)

      toast({
        title: "PDF Downloaded",
        description: `Timesheet for week ending ${submission.weekEnding} has been downloaded.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF.",
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

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">
                No submissions yet. Submit your first weekly timesheet to start tracking history.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Submissions</CardTitle>
            <CardDescription>
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          Week Ending: {format(new Date(submission.weekEnding), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          Employee: {submission.data.employeeName} (#{submission.data.employeeNumber})
                        </div>
                        <div>Department: {submission.data.department}</div>
                        <div>Adjustments: {submission.data.adjustments.length}</div>
                        <div>Submitted: {format(submission.submittedAt, "MMM dd, yyyy HH:mm")}</div>
                      </div>
                      {submission.data.adjustments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <div className="text-xs font-medium text-muted-foreground mb-1">Adjustment Dates:</div>
                          <div className="flex flex-wrap gap-1">
                            {submission.data.adjustments.map((adj, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {adj.date}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(submission)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(submission.id)}
                        title="Delete submission"
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
