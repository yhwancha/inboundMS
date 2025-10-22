"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CheckInFormPage() {
  const router = useRouter()
  const [containerNumber, setContainerNumber] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [matchStatus, setMatchStatus] = useState<'idle' | 'found' | 'not-found'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!containerNumber.trim()) {
      alert('Please enter a Container Number.')
      return
    }

    setIsSubmitting(true)
    setMatchStatus('idle')

    try {
      // localStorage에서 확인된 스케줄 데이터 가져오기
      const confirmedData = localStorage.getItem('confirmedScheduleData')
      
      if (!confirmedData) {
        alert('❌ No schedule data found. Please add schedules first.')
        setIsSubmitting(false)
        return
      }

      const scheduleData = JSON.parse(confirmedData)
      
      // Container Number의 처음 10자리로 매칭 확인 (대소문자 구분 없이)
      const inputPrefix = containerNumber.trim().substring(0, 10).toUpperCase()
      const matchedItem = scheduleData.find((item: any) => 
        item.cntr && item.cntr.substring(0, 10).toUpperCase() === inputPrefix
      )

      if (!matchedItem) {
        setMatchStatus('not-found')
        alert('❌ Container not found in schedule. Please check the container number.')
        setIsSubmitting(false)
        return
      }

      // 현재 시간을 HH:MM 형식으로 가져오기
      const now = new Date()
      const currentTime = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })

      // Check-in 시간 업데이트
      const updatedData = scheduleData.map((item: any) => 
        item.id === matchedItem.id ? { ...item, checkInTime: currentTime } : item
      )

      // localStorage에 업데이트
      localStorage.setItem('confirmedScheduleData', JSON.stringify(updatedData))

      setMatchStatus('found')
      
      // Success message
      alert(`✅ Check In completed!\nContainer: ${matchedItem.cntr}\nHBL: ${matchedItem.hbl}\nTime: ${currentTime}`)
      
      // Clear input field
      setContainerNumber("")
      
      // 2초 후 상태 초기화
      setTimeout(() => {
        setMatchStatus('idle')
      }, 2000)
      
    } catch (error: any) {
      console.error('Check In error:', error)
      alert(`❌ Error: ${error.message || 'Failed to complete check-in. Please try again.'}`)
      setMatchStatus('idle')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Check In</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Container Check In</CardTitle>
          <CardDescription>
            Enter container number to check in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Container Number Input */}
            <div className="space-y-2">
              <Label htmlFor="containerNumber" className="text-lg font-semibold">
                Container Number *
              </Label>
              <Input
                id="containerNumber"
                type="text"
                placeholder="Enter container number..."
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                className={`text-2xl h-20 text-center font-mono transition-colors ${
                  matchStatus === 'found' ? 'border-green-500 bg-green-50' :
                  matchStatus === 'not-found' ? 'border-red-500 bg-red-50' : ''
                }`}
                maxLength={11}
                required
                autoComplete="off"
              />
              <p className="text-sm text-gray-500 text-center">
                Enter up to 11 characters (first 10 will be matched)
              </p>
              {matchStatus === 'found' && (
                <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  <span>Container found and checked in!</span>
                </div>
              )}
              {matchStatus === 'not-found' && (
                <div className="text-red-600 text-center font-medium">
                  Container not found in schedule
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-16 text-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Checking In...' : 'Submit Check In'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="list-disc list-inside space-y-2">
            <li>Enter the container number (up to 11 characters)</li>
            <li>The first 10 digits will be matched with the schedule</li>
            <li>Click "Submit Check In" to complete the process</li>
            <li>Check-in time will be automatically recorded</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

