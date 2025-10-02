"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail } from "lucide-react"

interface EmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (email: string, subject: string, body: string) => void
  defaultEmail?: string
}

export default function EmailDialog({ open, onOpenChange, onSend, defaultEmail = "" }: EmailDialogProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [subject, setSubject] = useState("Timesheet Correction Form")
  const [body, setBody] = useState(
    "Please find attached the timesheet correction form for your review and approval.\n\nThank you.",
  )

  useEffect(() => {
    const saved = localStorage.getItem("emailSettings")
    if (saved) {
      const settings = JSON.parse(saved)
      setEmail(settings.defaultEmail || defaultEmail)
      setSubject(settings.defaultSubject || "Timesheet Correction Form")
      setBody(
        settings.defaultBody ||
          "Please find attached the timesheet correction form for your review and approval.\n\nThank you.",
      )
    }
  }, [defaultEmail])

  const handleSend = () => {
    if (email) {
      onSend(email, subject, body)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Timesheet via Email</DialogTitle>
          <DialogDescription>Configure the email details. The PDF will be prepared for sending.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="supervisor@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Timesheet Correction Form"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              placeholder="Enter your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!email}>
            <Mail className="mr-2 h-4 w-4" />
            Prepare Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
