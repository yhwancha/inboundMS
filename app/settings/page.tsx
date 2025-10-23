"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Save } from "lucide-react"

interface EmailSettings {
  defaultEmail: string
  defaultSubject: string
  defaultBody: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<EmailSettings>({
    defaultEmail: "",
    defaultSubject: "Timesheet Correction Form - Week Ending [DATE]",
    defaultBody: "Please find attached the timesheet correction form for review and approval.\n\nThank you.",
  })

  useEffect(() => {
    // Load settings from API
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        
        if (data && data.logoUrl) {
          setSettings({
            defaultEmail: data.logoUrl || "",
            defaultSubject: data.userImage || "Timesheet Correction Form - Week Ending [DATE]",
            defaultBody: "Please find attached the timesheet correction form for review and approval.\n\nThank you.",
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    
    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoUrl: settings.defaultEmail,
          userImage: settings.defaultSubject
        })
      })
      
      toast({
        title: "Settings Saved",
        description: "Your email settings have been saved successfully.",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your timesheet management preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>Set default email settings for sending timesheet corrections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultEmail">Default Recipient Email</Label>
            <Input
              id="defaultEmail"
              type="email"
              placeholder="supervisor@company.com"
              value={settings.defaultEmail}
              onChange={(e) => setSettings({ ...settings, defaultEmail: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              The email address where timesheet corrections will be sent every Monday
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultSubject">Default Email Subject</Label>
            <Input
              id="defaultSubject"
              placeholder="Timesheet Correction Form"
              value={settings.defaultSubject}
              onChange={(e) => setSettings({ ...settings, defaultSubject: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Use [DATE] as a placeholder for the week ending date</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultBody">Default Email Body</Label>
            <Textarea
              id="defaultBody"
              rows={6}
              placeholder="Enter your default email message..."
              value={settings.defaultBody}
              onChange={(e) => setSettings({ ...settings, defaultBody: e.target.value })}
            />
          </div>

          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Application information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <p className="font-medium">Timesheet Management System</p>
            <p className="text-muted-foreground">Version 1.0.0</p>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground">
              This application helps you manage weekly timesheet corrections for your logistics company. Create, save,
              and send timesheet corrections with ease.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
