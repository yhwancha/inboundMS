"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, Edit2, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ScheduleItem {
  id: string
  dock: string
  hbl: string
  cntr: string // Renamed from contNum to cntr
  appointmentTime: string
  location: string
  note: string
  status: "free" | "unloading" | "hold"
  type: "Cell" | "Pack"
  checkInTime: string
}

export default function CheckInPage() {
  const router = useRouter()
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([])
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editTime, setEditTime] = useState<string>("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editNote, setEditNote] = useState<string>("")
  const [containerInput, setContainerInput] = useState<string>("")
  const [matchedItemId, setMatchedItemId] = useState<string | null>(null)

  // API에서 스케줄 데이터 불러오기
  useEffect(() => {
    const loadScheduleData = async () => {
      try {
        const response = await fetch('/api/schedule')
        const data = await response.json()
        
        console.log('Check In Page - Loading data from API:', data)
        
        // Map API data to schedule format
        const scheduleDataWithCheckIn = data.map((item: any) => ({
          id: item.id,
          dock: item.dock || "",
          hbl: item.clientName || item.hbl || "",
          cntr: item.phoneNumber || item.cntr || "",
          appointmentTime: item.appointmentTime || "",
          location: item.locationId || "",
          note: item.notes || "",
          status: "free",
          type: item.serviceType?.includes('Cell') ? "Cell" : "Pack",
          checkInTime: item.checkInTime || ""
        }))
        
        setScheduleData(scheduleDataWithCheckIn)
        console.log('Loaded schedule data for Check In:', scheduleDataWithCheckIn)
      } catch (error) {
        console.error('Error loading schedule data for Check In:', error)
        setScheduleData([])
      }
    }

    loadScheduleData()
    
    // 페이지가 포커스될 때마다 데이터 새로고침
    const handleFocus = () => {
      loadScheduleData()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  // Container Number 입력 처리
  const handleContainerInputChange = (value: string) => {
    setContainerInput(value)
    
    // 10자리 이상 입력되면 자동으로 매칭 시도
    if (value.length >= 10) {
      const inputFirst10 = value.substring(0, 10).toUpperCase()
      
      // scheduleData에서 앞 10자리가 일치하는 항목 찾기
      const matchedItem = scheduleData.find(item => {
        const cntrFirst10 = item.cntr.substring(0, 10).toUpperCase()
        return cntrFirst10 === inputFirst10
      })
      
      if (matchedItem) {
        setMatchedItemId(matchedItem.id)
        console.log('Matched container:', matchedItem.cntr)
      } else {
        setMatchedItemId(null)
        console.log('No matching container found for:', inputFirst10)
      }
    } else {
      setMatchedItemId(null)
    }
  }

  // Container Number 매칭 후 체크인
  const handleContainerCheckIn = () => {
    if (matchedItemId) {
      handleCheckIn(matchedItemId)
      setContainerInput("")
      setMatchedItemId(null)
    }
  }

  const handleCheckIn = (id: string) => {
    // 현재 시간을 HH:MM 형식으로 가져오기
    const now = new Date()
    const currentTime = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const updatedData = scheduleData.map(item => 
      item.id === id ? { ...item, checkInTime: currentTime } : item
    )
    setScheduleData(updatedData)
    
    // localStorage에도 업데이트된 데이터 저장
    try {
      localStorage.setItem('confirmedScheduleData', JSON.stringify(updatedData))
      console.log('Updated check-in time in localStorage:', currentTime)
    } catch (error) {
      console.error('Error saving check-in time to localStorage:', error)
    }
  }

  const handleCancelCheckIn = (id: string) => {
    const updatedData = scheduleData.map(item => 
      item.id === id ? { ...item, checkInTime: "" } : item
    )
    setScheduleData(updatedData)
    
    // localStorage에도 업데이트된 데이터 저장
    try {
      localStorage.setItem('confirmedScheduleData', JSON.stringify(updatedData))
      console.log('Cancelled check-in for item:', id)
    } catch (error) {
      console.error('Error cancelling check-in in localStorage:', error)
    }
  }

  const handleEditClick = (id: string, currentTime: string) => {
    setEditingItemId(id)
    setEditTime(currentTime)
  }

  const handleEditSave = (id: string) => {
    if (editTime.trim()) {
      const updatedData = scheduleData.map(item => 
        item.id === id ? { ...item, checkInTime: editTime } : item
      )
      setScheduleData(updatedData)
      
      // localStorage에도 업데이트된 데이터 저장
      try {
        localStorage.setItem('confirmedScheduleData', JSON.stringify(updatedData))
        console.log('Updated check-in time via edit in localStorage:', editTime)
      } catch (error) {
        console.error('Error saving edited check-in time to localStorage:', error)
      }
    }
    
    setEditingItemId(null)
    setEditTime("")
  }

  const handleEditCancel = () => {
    setEditingItemId(null)
    setEditTime("")
  }

  const handleNoteEditClick = (id: string, currentNote: string) => {
    setEditingNoteId(id)
    setEditNote(currentNote)
  }

  const handleNoteEditSave = (id: string) => {
    const updatedData = scheduleData.map(item => 
      item.id === id ? { ...item, note: editNote } : item
    )
    setScheduleData(updatedData)
    
    // localStorage에도 업데이트된 데이터 저장
    try {
      localStorage.setItem('confirmedScheduleData', JSON.stringify(updatedData))
      console.log('Updated note via edit in localStorage:', editNote)
    } catch (error) {
      console.error('Error saving edited note to localStorage:', error)
    }
    
    setEditingNoteId(null)
    setEditNote("")
  }

  const handleNoteEditCancel = () => {
    setEditingNoteId(null)
    setEditNote("")
  }

  // 시간을 분으로 변환하는 함수 (정렬용)
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0
    
    // "10:30 AM" 형식 파싱
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
    if (match) {
      let hours = parseInt(match[1])
      const minutes = parseInt(match[2])
      const ampm = match[3].toUpperCase()
      
      if (ampm === 'PM' && hours !== 12) {
        hours += 12
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0
      }
      
      return hours * 60 + minutes
    }
    
    // "10:30" 형식 파싱
    const simpleMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
    if (simpleMatch) {
      const hours = parseInt(simpleMatch[1])
      const minutes = parseInt(simpleMatch[2])
      return hours * 60 + minutes
    }
    
    return 0
  }

  // Appointment Time 정렬 함수
  const handleSortByAppointmentTime = () => {
    if (sortOrder === null || sortOrder === 'desc') {
      // 오름차순 정렬
      const sorted = [...scheduleData].sort((a, b) => {
        const timeA = timeToMinutes(a.appointmentTime)
        const timeB = timeToMinutes(b.appointmentTime)
        return timeA - timeB
      })
      setScheduleData(sorted)
      setSortOrder('asc')
    } else {
      // 내림차순 정렬
      const sorted = [...scheduleData].sort((a, b) => {
        const timeA = timeToMinutes(a.appointmentTime)
        const timeB = timeToMinutes(b.appointmentTime)
        return timeB - timeA
      })
      setScheduleData(sorted)
      setSortOrder('desc')
    }
  }

  const getStatusColor = (status: "free" | "unloading" | "hold") => {
    switch (status) {
      case "free":
        return "bg-green-500"
      case "unloading":
        return "bg-red-500"
      case "hold":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
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

      {/* Container Number Input */}
      <Card>
        <CardHeader>
          <CardTitle>Container Number Check In</CardTitle>
          <CardDescription>Enter container number (10 digits) to check in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="containerInput" className="text-sm font-medium mb-2 block">
                Container Number
              </label>
              <Input
                id="containerInput"
                type="text"
                placeholder="Enter 10 digits of container number..."
                value={containerInput}
                onChange={(e) => handleContainerInputChange(e.target.value)}
                className={`text-lg ${matchedItemId ? 'border-green-500 bg-green-50' : ''}`}
                maxLength={11}
              />
            </div>
            <Button
              onClick={handleContainerCheckIn}
              disabled={!matchedItemId}
              className="px-8"
            >
              <Check className="h-4 w-4 mr-2" />
              Check In
            </Button>
          </div>
          {matchedItemId && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700 font-medium">
                ✓ Container matched: {scheduleData.find(item => item.id === matchedItemId)?.cntr}
              </p>
            </div>
          )}
          {containerInput.length >= 10 && !matchedItemId && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700 font-medium">
                ✗ No matching container found
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Table with Check In Time */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Check In</CardTitle>
          <CardDescription>Record check in times for scheduled items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dock</TableHead>
                  <TableHead>HBL</TableHead>
                  <TableHead>CNTR</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSortByAppointmentTime}
                      className="h-8 px-2 lg:px-3"
                    >
                      Appointment Time
                      {sortOrder === 'asc' ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : sortOrder === 'desc' ? (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Check In Time</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.dock}</TableCell>
                    <TableCell>{item.hbl}</TableCell>
                    <TableCell>{item.cntr}</TableCell>
                    <TableCell>{item.appointmentTime}</TableCell>
                    <TableCell className="text-center">
                      {editingItemId === item.id ? (
                        <div className="flex flex-col items-center gap-2">
                          <Input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-24 h-8 text-xs"
                          />
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSave(item.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleEditCancel}
                              className="h-6 px-2 text-xs"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : item.checkInTime ? (
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-sm font-medium text-green-600">
                            {item.checkInTime}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCheckIn(item.id)}
                              className="h-6 px-2 text-xs"
                            >
                              Update
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(item.id, item.checkInTime)}
                              className="h-6 px-2 text-xs"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelCheckIn(item.id)}
                              className="h-6 px-2 text-xs border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleCheckIn(item.id)}
                          className="h-8 px-4"
                        >
                          Check In
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingNoteId === item.id ? (
                        <div className="flex flex-col gap-2">
                          <Textarea
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            className="min-h-[60px] text-sm"
                            placeholder="Enter note..."
                          />
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNoteEditSave(item.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleNoteEditCancel}
                              className="h-6 px-2 text-xs"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm flex-1 min-w-0">
                            {item.note || <span className="text-gray-400 italic">No note</span>}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleNoteEditClick(item.id, item.note || "")}
                            className="h-6 px-2 text-xs flex-shrink-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {scheduleData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No schedule data available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
