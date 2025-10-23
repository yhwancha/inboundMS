"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Download, X, Plus, Edit2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import * as XLSX from "xlsx"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  checkInTime?: string // Optional check-in time field
  supervisorTasksCompleted?: string[] // Array of completed supervisor task IDs
}

interface TodoItem {
  id: string
  text: string
  completed: boolean
}

export default function SchedulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedDock, setSelectedDock] = useState<number | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [dockStatuses, setDockStatuses] = useState<Record<number, 'available' | 'disabled'>>({})
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<ScheduleItem | null>(null)
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [checkedInDocks, setCheckedInDocks] = useState<Set<number>>(new Set())
  const [assignedDocks, setAssignedDocks] = useState<Set<number>>(new Set())
  const [checkedInItems, setCheckedInItems] = useState<ScheduleItem[]>([])
  const [isEditingDockAssignment, setIsEditingDockAssignment] = useState(false)
  const [checkInSortOrder, setCheckInSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [apptTimeSortOrder, setApptTimeSortOrder] = useState<'asc' | 'desc' | null>(null)
  
  // Load available locations from API
  useEffect(() => {
    const fetchAvailableLocations = async () => {
      try {
        const response = await fetch('/api/location')
        const data = await response.json()
        const available = data
          .filter((loc: any) => loc.status === 'available')
          .map((loc: any) => loc.id)
        setAvailableLocations(available)
      } catch (error) {
        console.error('Error fetching locations:', error)
      }
    }
    
    fetchAvailableLocations()
    
    // Set up an interval to check for updates
    const interval = setInterval(() => {
      fetchAvailableLocations()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const [supervisorTodos, setSupervisorTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Assign dock to container', completed: false },
    { id: '2', text: 'Assign inbound leader to dock', completed: false },
  ])
  const [workerTodos, setWorkerTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Get container HBL', completed: false },
    { id: '2', text: 'Take photo of container outside', completed: false },
    { id: '3', text: 'Take photo of container seal and check container seal', completed: false },
    { id: '4', text: 'Take photo of container inside', completed: false },
    { id: '5', text: 'Put on the air lock', completed: false },
    { id: '6', text: 'Unload container', completed: false },
    { id: '7', text: 'Count the number of pallets in the container', completed: false },
    { id: '8', text: 'Scan the pallets', completed: false },
    { id: '9', text: 'Move the pallets to the warehouse location', completed: false },
    { id: '10', text: 'Put the container paper in the container', completed: false },
  ])
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([])

  // Check In되었지만 Dock이 할당되지 않은 항목들을 확인하는 함수
  const getCheckedInWithoutDock = () => {
    return scheduleData.filter(item => 
      item.checkInTime && 
      item.checkInTime.trim() !== '' && 
      (!item.dock || item.dock.trim() === '')
    )
  }

  // 이미 할당된 Dock 번호들을 확인하는 함수
  const getAssignedDocks = () => {
    const assigned = new Set<number>()
    scheduleData.forEach(item => {
      if (item.dock && item.dock.trim() !== '') {
        const dockMatch = item.dock.match(/DOCK-(\d+)|^(\d+)$/)
        if (dockMatch) {
          const dockNumber = parseInt(dockMatch[1] || dockMatch[2])
          if (!isNaN(dockNumber)) {
            assigned.add(dockNumber)
          }
        }
      }
    })
    return assigned
  }

  // API에서 스케줄 데이터 불러오기
  useEffect(() => {
    const loadScheduleData = async () => {
      try {
        const response = await fetch('/api/schedule')
        const data = await response.json()
        
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
        console.log('Loaded schedule data from API:', scheduleDataWithCheckIn)
      } catch (error) {
        console.error('Error loading schedule data:', error)
        // Fallback to empty array
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

  // Check In된 항목들과 할당된 Dock들을 업데이트
  useEffect(() => {
    const assigned = getAssignedDocks()
    const checkedInWithoutDock = getCheckedInWithoutDock()
    // Dock이 할당되지 않은 체크인된 항목들만 표시
    const checkedInNoDock = scheduleData.filter(item => 
      item.checkInTime && 
      item.checkInTime.trim() !== '' && 
      (!item.dock || item.dock.trim() === '')
    )
    setAssignedDocks(assigned)
    setCheckedInItems(checkedInNoDock)
    console.log('Assigned docks:', Array.from(assigned))
    console.log('Checked in without dock:', checkedInNoDock.length)
    
    // 사용 중인 Location들을 확인하고 자동으로 disable 처리
    syncLocationStatuses()
  }, [scheduleData])

  // Location 상태 동기화 함수
  const syncLocationStatuses = () => {
    const { getLocationStatuses, saveLocationStatuses, getAvailableLocations } = require('@/lib/location-storage')
    const currentStatuses = getLocationStatuses()
    
    // scheduleData에서 사용 중인 Location들 찾기
    const usedLocations = new Set<string>()
    scheduleData.forEach(item => {
      if (item.location && item.location !== 'stage' && item.location.trim() !== '') {
        usedLocations.add(item.location)
      }
    })
    
    // 사용 중인 Location만 disabled로 설정
    let hasChanges = false
    Object.keys(currentStatuses).forEach(locationId => {
      const shouldBeDisabled = usedLocations.has(locationId)
      const currentStatus = currentStatuses[locationId]
      
      if (shouldBeDisabled && currentStatus === 'available') {
        currentStatuses[locationId] = 'disabled'
        hasChanges = true
        console.log(`Auto-disabled location: ${locationId}`)
      }
    })
    
    if (hasChanges) {
      saveLocationStatuses(currentStatuses)
      setAvailableLocations(getAvailableLocations())
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // TODO: Implement Excel file parsing
      console.log("File selected:", file.name)
      // Here you would parse the Excel file and update scheduleData
    }
  }

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log("Exporting to Excel...")
  }

  const handleStatusChange = (itemId: string, newStatus: "free" | "unloading" | "hold") => {
    setScheduleData(prevData =>
      prevData.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    )
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

  // Driver Check-in List 정렬 함수
  const handleSortCheckInByTime = () => {
    setApptTimeSortOrder(null)
    if (checkInSortOrder === null) {
      setCheckInSortOrder('asc')
    } else if (checkInSortOrder === 'asc') {
      setCheckInSortOrder('desc')
    } else {
      setCheckInSortOrder('asc')
    }
  }

  const handleSortCheckInByApptTime = () => {
    setCheckInSortOrder(null)
    if (apptTimeSortOrder === null) {
      setApptTimeSortOrder('asc')
    } else if (apptTimeSortOrder === 'asc') {
      setApptTimeSortOrder('desc')
    } else {
      setApptTimeSortOrder('asc')
    }
  }

  // useMemo로 정렬된 체크인 리스트를 메모이제이션
  const sortedCheckedInItems = useMemo(() => {
    let sorted = [...checkedInItems]
    
    if (checkInSortOrder) {
      // Sort by check-in time (HH:MM 형식)
      sorted.sort((a, b) => {
        if (!a.checkInTime) return 1
        if (!b.checkInTime) return -1
        
        // HH:MM 형식을 분 단위로 변환
        const timeA = timeToMinutes(a.checkInTime)
        const timeB = timeToMinutes(b.checkInTime)
        
        return checkInSortOrder === 'asc' ? timeA - timeB : timeB - timeA
      })
    } else if (apptTimeSortOrder) {
      // Sort by appointment time
      sorted.sort((a, b) => {
        const timeA = timeToMinutes(a.appointmentTime || '00:00')
        const timeB = timeToMinutes(b.appointmentTime || '00:00')
        return apptTimeSortOrder === 'asc' ? timeA - timeB : timeB - timeA
      })
    }
    
    return sorted
  }, [checkedInItems, checkInSortOrder, apptTimeSortOrder])

  // Generate dock numbers from 4 to 32, incrementing by 2 (ascending order, excluding 2)
  const generateDockNumbers = () => {
    const docks = []
    for (let i = 4; i <= 32; i += 2) {
      docks.push(i)
    }
    // Add 60-70 range
    for (let i = 60; i <= 70; i += 2) {
      docks.push(i)
    }
    return docks
  }

  // Group docks with office as separate group
  const groupDocksWithOffice = (docks: number[]) => {
    const groups = []
    
    // First group: 4, 6, 8
    groups.push(docks.slice(0, 3))
    
    // Second group: 10, 12, 14
    groups.push(docks.slice(3, 6))
    
    // Third group: 16, 18, 20
    groups.push(docks.slice(6, 9))
    
    // Fourth group: Office (separate)
    groups.push(['office'])
    
    // Fifth group: 22, 24, 26
    groups.push(docks.slice(9, 12))
    
    // Sixth group: 28, 30, 32
    groups.push(docks.slice(12, 15))
    
    // Seventh group: 60, 62, 64
    groups.push(docks.slice(15, 18))
    
    // Eighth group: 66, 68, 70
    groups.push(docks.slice(18, 21))
    
    return groups
  }

  const handleDockClick = (dockNumber: number) => {
    console.log(`Dock ${dockNumber} clicked`)
    if (editMode) {
      // Edit 모드: Dock 상태 변경
      setSelectedDock(selectedDock === dockNumber ? null : dockNumber)
    } else {
      // 일반 모드: 선택된 Check In 항목에 Dock 할당
      // Dock이 이미 할당되었거나 disabled 상태면 클릭 불가
      if (assignedDocks.has(dockNumber) || getDockStatus(dockNumber) === 'disabled') {
        console.log(`Dock ${dockNumber} is already assigned or disabled`)
        return
      }
      
      // 선택된 Check In 항목이 있으면 해당 항목에 할당
      if (selectedScheduleItem && selectedScheduleItem.checkInTime && selectedScheduleItem.checkInTime.trim() !== '') {
        const updatedData = scheduleData.map(item => 
          item.id === selectedScheduleItem.id 
            ? { ...item, dock: `DOCK-${String(dockNumber).padStart(2, '0')}`, location: (item.location && item.location.trim() !== '') ? item.location : "stage" } 
            : item
        )
        setScheduleData(updatedData)
        
        // localStorage에도 업데이트
        try {
          localStorage.setItem('confirmedScheduleData', JSON.stringify(updatedData))
          console.log(`Assigned dock ${dockNumber} to item ${selectedScheduleItem.id}`)
          
          // Edit 모드인 경우 Edit 모드 해제
          if (isEditingDockAssignment) {
            setIsEditingDockAssignment(false)
          } else {
            setSelectedScheduleItem(null) // 선택 해제
          }
        } catch (error) {
          console.error('Error saving dock assignment to localStorage:', error)
        }
      } else {
        console.log('No selected checked-in item for dock assignment')
      }
    }
  }

  const handleEditDockToggle = () => {
    setEditMode(!editMode)
    setSelectedDock(null) // Clear selection when toggling edit mode
  }

  const handleDockStatusChange = (dockNumber: number, status: 'available' | 'disabled') => {
    setDockStatuses(prev => ({
      ...prev,
      [dockNumber]: status
    }))
    setSelectedDock(null) // Clear selection after changing status
  }

  // Location 편집 함수들
  const handleLocationEditClick = (id: string, currentLocation: string) => {
    setEditingLocationId(id)
    setEditLocation(currentLocation)
  }

  const handleLocationEditSave = (id: string) => {
    const updatedData = scheduleData.map(item => 
      item.id === id ? { ...item, location: editLocation } : item
    )
    setScheduleData(updatedData)
    
    // localStorage에도 업데이트
    try {
      localStorage.setItem('confirmedScheduleData', JSON.stringify(updatedData))
      console.log('Updated location via edit in localStorage:', editLocation)
    } catch (error) {
      console.error('Error saving edited location to localStorage:', error)
    }
    
    setEditingLocationId(null)
    setEditLocation("")
  }

  const handleLocationEditCancel = () => {
    setEditingLocationId(null)
    setEditLocation("")
  }

  // Location 선택 함수 (Dock이 할당된 경우)
  const handleLocationSelect = (id: string, newLocation: string) => {
    // 이전 Location 가져오기
    const currentItem = scheduleData.find(item => item.id === id)
    const oldLocation = currentItem?.location
    
    const updatedData = scheduleData.map(item => 
      item.id === id ? { ...item, location: newLocation } : item
    )
    setScheduleData(updatedData)
    
    // localStorage에도 업데이트
    try {
      localStorage.setItem('confirmedScheduleData', JSON.stringify(updatedData))
      console.log('Updated location via select in localStorage:', newLocation)
      
      // Location 상태 업데이트
      updateLocationStatuses(oldLocation, newLocation, updatedData)
    } catch (error) {
      console.error('Error saving selected location to localStorage:', error)
    }
  }

  // Location 상태 업데이트 함수
  const updateLocationStatuses = (oldLocation: string | undefined, newLocation: string, currentData: ScheduleItem[]) => {
    const { toggleLocationStatus, getAvailableLocations, getLocationStatuses } = require('@/lib/location-storage')
    
    // 새 Location이 "stage"가 아니고 available이면 disable 처리
    if (newLocation !== 'stage' && availableLocations.includes(newLocation)) {
      toggleLocationStatus(newLocation)
      console.log(`Disabled location: ${newLocation}`)
    }
    
    // 이전 Location이 더 이상 사용되지 않으면 다시 enable
    if (oldLocation && oldLocation !== 'stage' && oldLocation !== newLocation) {
      const isStillUsed = currentData.some(item => item.location === oldLocation && item.id !== currentData.find(d => d.location === newLocation)?.id)
      if (!isStillUsed) {
        // Location 상태 확인
        const statuses = getLocationStatuses()
        if (statuses[oldLocation] === 'disabled') {
          toggleLocationStatus(oldLocation)
          console.log(`Re-enabled location: ${oldLocation}`)
        }
      }
    }
    
    // Available locations 업데이트
    setAvailableLocations(getAvailableLocations())
  }


  const getDockStatus = (dockNumber: number) => {
    return dockStatuses[dockNumber] || 'available'
  }

  // Dock에 할당된 항목 정보 가져오기
  const getDockInfo = (dockNumber: number) => {
    const dockString = `DOCK-${String(dockNumber).padStart(2, '0')}`
    const itemIndex = scheduleData.findIndex(item => item.dock === dockString)
    if (itemIndex !== -1) {
      const item = scheduleData[itemIndex]
      return {
        num: itemIndex + 1,
        hbl: item.hbl,
        cntr: item.cntr
      }
    }
    return null
  }

  const handleScheduleItemClick = (item: ScheduleItem) => {
    setSelectedScheduleItem(item)
    
    // Supervisor Tasks 상태를 해당 아이템의 완료 상태로 설정
    const completedTaskIds = item.supervisorTasksCompleted || []
    setSupervisorTodos(prev =>
      prev.map(todo => ({
        ...todo,
        completed: completedTaskIds.includes(todo.id)
      }))
    )
  }

  const handleBackToList = () => {
    setSelectedScheduleItem(null)
  }

  const handleTodoToggle = (todoId: string, isSupervisor: boolean) => {
    if (isSupervisor) {
      setSupervisorTodos(prev => 
        prev.map(todo => 
          todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
        )
      )
      
      // Update supervisorTasksCompleted for the selected schedule item
      if (selectedScheduleItem) {
        const currentCompleted = selectedScheduleItem.supervisorTasksCompleted || []
        const isCurrentlyCompleted = currentCompleted.includes(todoId)
        
        const updatedCompleted = isCurrentlyCompleted
          ? currentCompleted.filter(id => id !== todoId)
          : [...currentCompleted, todoId]
        
        const updatedItem = {
          ...selectedScheduleItem,
          supervisorTasksCompleted: updatedCompleted
        }
        
        // Update schedule data
        const updatedData = scheduleData.map(item =>
          item.id === selectedScheduleItem.id ? updatedItem : item
        )
        setScheduleData(updatedData)
        setSelectedScheduleItem(updatedItem)
        
        // Save to localStorage
        try {
          localStorage.setItem('confirmedScheduleData', JSON.stringify(updatedData))
        } catch (error) {
          console.error('Error saving supervisor tasks to localStorage:', error)
        }
      }
    } else {
      setWorkerTodos(prev => 
        prev.map(todo => 
          todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
        )
      )
    }
  }

  const handleOfficeClick = () => {
    console.log('Office clicked')
    // TODO: Handle office selection logic
  }

  const handleDownloadExcel = () => {
    try {
      // 데이터 준비
      const excelData = scheduleData.map((item, index) => ({
        'Num': index + 1,
        'Dock': item.dock || '',
        'HBL': item.hbl,
        'CNTR': item.cntr,
        'Appointment Time': item.appointmentTime,
        'Check-In Time': item.checkInTime || '',
        'Location': item.location || '',
        'Note': item.note || ''
      }))

      // 워크북 생성
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Schedule Data')

      // 컬럼 너비 설정
      ws['!cols'] = [
        { wch: 5 },  // Num
        { wch: 10 }, // Dock
        { wch: 15 }, // HBL
        { wch: 15 }, // CNTR
        { wch: 15 }, // Appointment Time
        { wch: 15 }, // Check-In Time
        { wch: 12 }, // Location
        { wch: 30 }  // Note
      ]

      // 파일명 생성 (현재 날짜 포함)
      const today = new Date()
      const dateStr = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-')
      const fileName = `Schedule_Data_${dateStr}.xlsx`

      // 파일 다운로드
      XLSX.writeFile(wb, fileName)

      console.log('Excel file downloaded:', fileName)
    } catch (error) {
      console.error('Error downloading Excel:', error)
      alert('Failed to download Excel file. Please try again.')
    }
  }

  const dockNumbers = generateDockNumbers()
  const dockGroups = groupDocksWithOffice(dockNumbers)

  // Show detail page if an item is selected
  if (selectedScheduleItem) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToList}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schedule
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {selectedScheduleItem.dock} - {selectedScheduleItem.contNum}
          </h1>
        </div>

        {/* Schedule Item Details */}
        <Card>
          <CardHeader>
            <CardTitle>Container Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">HBL</Label>
                <p className="text-sm">{selectedScheduleItem.hbl}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Appointment Time</Label>
                <p className="text-sm">{selectedScheduleItem.appointmentTime}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Location</Label>
                <p className="text-sm">{selectedScheduleItem.location}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Type</Label>
                <p className="text-sm">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    selectedScheduleItem.type === 'Cell' 
                      ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                      : 'bg-orange-100 text-orange-700 border border-orange-300'
                  }`}>
                    {selectedScheduleItem.type}
                  </span>
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <p className="text-sm capitalize">{selectedScheduleItem.status}</p>
              </div>
            </div>
            {selectedScheduleItem.note && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-500">Note</Label>
                <p className="text-sm mt-1">{selectedScheduleItem.note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Todo Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supervisor Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Supervisor Tasks</CardTitle>
              <CardDescription>Tasks to be completed by supervisor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {supervisorTodos.map((todo) => (
                <div key={todo.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`supervisor-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => handleTodoToggle(todo.id, true)}
                  />
                  <label
                    htmlFor={`supervisor-${todo.id}`}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                      todo.completed ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {todo.text}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Worker Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Worker Tasks</CardTitle>
              <CardDescription>Tasks to be completed by worker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {workerTodos.map((todo) => (
                <div key={todo.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`worker-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => handleTodoToggle(todo.id, false)}
                  />
                  <label
                    htmlFor={`worker-${todo.id}`}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                      todo.completed ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {todo.text}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Note Section */}
        <Card>
          <CardHeader>
            <CardTitle>Note</CardTitle>
            <CardDescription>Add or edit notes for this item</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={selectedScheduleItem?.note || ""}
              onChange={(e) => {
                if (selectedScheduleItem) {
                  const updatedData = scheduleData.map(item => 
                    item.id === selectedScheduleItem.id ? { ...item, note: e.target.value } : item
                  )
                  setScheduleData(updatedData)
                  setSelectedScheduleItem({ ...selectedScheduleItem, note: e.target.value })
                  
                  // localStorage에도 업데이트
                  try {
                    localStorage.setItem('confirmedScheduleData', JSON.stringify(updatedData))
                  } catch (error) {
                    console.error('Error saving note to localStorage:', error)
                  }
                }
              }}
              className="min-h-[100px]"
              placeholder="Enter notes here..."
            />
          </CardContent>
        </Card>

        {/* Dock Assignment Section */}
        {selectedScheduleItem && selectedScheduleItem.checkInTime && selectedScheduleItem.checkInTime.trim() !== '' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-600">Dock Assignment</CardTitle>
                  <CardDescription>
                    {selectedScheduleItem.dock && selectedScheduleItem.dock.trim() !== '' ? (
                      <>Current dock: <strong>{selectedScheduleItem.dock}</strong> for <strong>{selectedScheduleItem.hbl}</strong></>
                    ) : (
                      <>Select a dock for this checked-in item: <strong>{selectedScheduleItem.hbl}</strong></>
                    )}
                  </CardDescription>
                </div>
                {selectedScheduleItem.dock && selectedScheduleItem.dock.trim() !== '' && (
                  <Button
                    onClick={() => setIsEditingDockAssignment(!isEditingDockAssignment)}
                    variant={isEditingDockAssignment ? "default" : "outline"}
                    size="sm"
                  >
                    {isEditingDockAssignment ? "Cancel" : "Edit Assign"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Dock 상태 정보 */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
                      <span>Ready for Assignment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <span>Assigned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-400 rounded"></div>
                      <span>Disabled</span>
                    </div>
                  </div>
                  <div className="text-gray-600">
                    {isEditingDockAssignment ? (
                      <span className="text-orange-600 font-medium">
                        Edit mode: Click a dock to change assignment
                      </span>
                    ) : selectedScheduleItem.dock && selectedScheduleItem.dock.trim() !== '' ? (
                      <span className="text-blue-600 font-medium">
                        Dock assigned. Click "Edit Assign" to change.
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        Click a dock to assign it to this item
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6">
                {dockGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="flex gap-2">
                    {group.map((item) => (
                      item === 'office' ? (
                        <button
                          key="office"
                          onClick={handleOfficeClick}
                          className="w-20 h-12 border-2 border-purple-300 rounded-lg bg-purple-50 hover:bg-purple-100 hover:border-purple-500 transition-colors duration-200 flex items-center justify-center font-semibold text-purple-700 hover:text-purple-800"
                        >
                          Office
                        </button>
                      ) : (
                        <div key={item} className="relative">
                          <button
                            onClick={() => {
                              // Edit 모드이거나 Dock이 할당되지 않은 경우에만 클릭 가능
                              if (isEditingDockAssignment || !selectedScheduleItem.dock || selectedScheduleItem.dock.trim() === '') {
                                handleDockClick(item as number)
                              }
                            }}
                            className={`w-16 h-12 border-2 rounded-lg transition-colors duration-200 flex items-center justify-center font-semibold relative ${
                              getDockStatus(item as number) === 'disabled'
                                ? 'border-red-400 bg-red-100 text-red-700 cursor-not-allowed'
                                : !isEditingDockAssignment && selectedScheduleItem.dock && selectedScheduleItem.dock.trim() !== ''
                                ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                                : assignedDocks.has(item as number) && (!isEditingDockAssignment || selectedScheduleItem.dock === `DOCK-${String(item).padStart(2, '0')}`)
                                ? 'border-gray-400 bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'border-green-400 bg-green-100 hover:bg-green-200 hover:border-green-600 text-green-700 hover:text-green-800 cursor-pointer'
                            }`}
                            disabled={
                              getDockStatus(item as number) === 'disabled' || 
                              (!isEditingDockAssignment && selectedScheduleItem.dock && selectedScheduleItem.dock.trim() !== '') ||
                              (assignedDocks.has(item as number) && (!isEditingDockAssignment || selectedScheduleItem.dock === `DOCK-${String(item).padStart(2, '0')}`))
                            }
                          >
                            <div className="text-center">
                              <div className="text-sm font-bold">{item}</div>
                              {assignedDocks.has(item as number) && (
                                <div className="text-xs mt-0.5 truncate max-w-[50px]">
                                  {scheduleData.find(d => {
                                    const dockMatch = d.dock.match(/DOCK-(\d+)|^(\d+)$/)
                                    return dockMatch && parseInt(dockMatch[1] || dockMatch[2]) === item
                                  })?.cntr?.substring(0, 8) || ''}
                                </div>
                              )}
                            </div>
                            {getDockStatus(item as number) === 'disabled' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-50">
                                <span className="text-red-600 font-bold text-2xl">✕</span>
                              </div>
                            )}
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
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
        <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
      </div>

      {/* Driver Check-in List */}
      {checkedInItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Check-In List</CardTitle>
            <CardDescription>
              Currently checked-in drivers ({checkedInItems.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Num</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 -ml-2"
                        onClick={handleSortCheckInByApptTime}
                      >
                        Appointment Time
                        {apptTimeSortOrder === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                        {apptTimeSortOrder === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                        {!apptTimeSortOrder && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 -ml-2"
                        onClick={handleSortCheckInByTime}
                      >
                        Check-In Time
                        {checkInSortOrder === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
                        {checkInSortOrder === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
                        {!checkInSortOrder && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>HBL</TableHead>
                    <TableHead>CNTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCheckedInItems
                    .map((item) => {
                      const itemIndex = scheduleData.findIndex(d => d.id === item.id)
                      const num = itemIndex !== -1 ? itemIndex + 1 : '-'
                      
                      // Format check-in time (HH:MM -> HH:MM AM/PM)
                      let formattedCheckInTime = '-'
                      if (item.checkInTime && item.checkInTime.trim() !== '') {
                        try {
                          // HH:MM 형식을 AM/PM 형식으로 변환
                          const [hours, minutes] = item.checkInTime.split(':').map(Number)
                          if (!isNaN(hours) && !isNaN(minutes)) {
                            const period = hours >= 12 ? 'PM' : 'AM'
                            const displayHours = hours % 12 || 12
                            formattedCheckInTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
                          } else {
                            formattedCheckInTime = item.checkInTime
                          }
                        } catch (e) {
                          formattedCheckInTime = item.checkInTime
                        }
                      }
                      
                      // Format appointment time
                      let formattedApptTime = item.appointmentTime || '-'
                      
                      return (
                        <TableRow key={item.id} className="hover:bg-accent/50">
                          <TableCell className="font-semibold">#{num}</TableCell>
                          <TableCell className="font-mono text-sm">{formattedApptTime}</TableCell>
                          <TableCell className="font-mono text-sm">{formattedCheckInTime}</TableCell>
                          <TableCell className="font-medium">{item.hbl}</TableCell>
                          <TableCell>{item.cntr}</TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dock Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dock Map</CardTitle>
              <CardDescription>
                {editMode 
                  ? "Edit mode: Click on a dock to change its status" 
                  : "Click on a dock to view its details"
                }
              </CardDescription>
            </div>
            <Button
              onClick={handleEditDockToggle}
              variant={editMode ? "default" : "outline"}
              size="sm"
            >
              {editMode ? "Exit Edit" : "Edit Dock"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Dock 상태 정보 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
                  <span>Ready for Assignment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span>Assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-400 rounded"></div>
                  <span>Disabled</span>
                </div>
              </div>
              <div className="text-gray-600">
                {checkedInItems.length > 0 ? (
                  <span className="text-green-600 font-medium">
                    {checkedInItems.length} item(s) ready for dock assignment
                  </span>
                ) : (
                  <span>No checked-in items available</span>
                )}
              </div>
            </div>
          </div>
          
          <TooltipProvider>
            <div className="flex flex-wrap justify-center gap-6">
              {dockGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="flex gap-2">
                  {group.map((item) => (
                    item === 'office' ? (
                      <button
                        key="office"
                        onClick={handleOfficeClick}
                        className="w-20 h-12 border-2 border-purple-300 rounded-lg bg-purple-50 hover:bg-purple-100 hover:border-purple-500 transition-colors duration-200 flex items-center justify-center font-semibold text-purple-700 hover:text-purple-800"
                      >
                        Office
                      </button>
                    ) : (
                      <Tooltip key={item}>
                        <TooltipTrigger asChild>
                          <div className="relative">
                      <button
                        onClick={() => handleDockClick(item as number)}
                        className={`w-16 h-12 border-2 rounded-lg transition-colors duration-200 flex items-center justify-center font-semibold relative ${
                          getDockStatus(item as number) === 'disabled'
                            ? 'border-red-400 bg-red-100 text-red-700 cursor-not-allowed'
                            : editMode && selectedDock === item
                            ? 'border-blue-400 bg-blue-100 text-blue-700 cursor-pointer'
                            : !editMode && assignedDocks.has(item as number)
                            ? 'border-gray-400 bg-gray-300 text-gray-600 cursor-not-allowed'
                            : !editMode && checkedInItems.length > 0 && getDockStatus(item as number) !== 'disabled'
                            ? 'border-green-400 bg-green-100 hover:bg-green-200 hover:border-green-600 text-green-700 hover:text-green-800 cursor-pointer'
                            : editMode
                            ? 'border-gray-300 bg-white hover:bg-gray-50 hover:border-blue-500 text-gray-700 hover:text-blue-600 cursor-pointer'
                            : 'border-gray-300 bg-gray-50 text-gray-500 cursor-default'
                        }`}
                        disabled={!editMode && (getDockStatus(item as number) === 'disabled' || assignedDocks.has(item as number) || checkedInItems.length === 0)}
                      >
                        <div className="text-center">
                          <div className="text-sm font-bold">{item}</div>
                          {assignedDocks.has(item as number) && (
                            <div className="text-xs mt-0.5 truncate max-w-[50px]">
                              {scheduleData.find(d => {
                                const dockMatch = d.dock.match(/DOCK-(\d+)|^(\d+)$/)
                                return dockMatch && parseInt(dockMatch[1] || dockMatch[2]) === item
                              })?.cntr?.substring(0, 8) || ''}
                            </div>
                          )}
                        </div>
                        {getDockStatus(item as number) === 'disabled' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-50">
                            <span className="text-red-600 font-bold text-2xl">✕</span>
                          </div>
                        )}
                      </button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {(() => {
                            const dockInfo = getDockInfo(item as number)
                            return dockInfo ? (
                              <div className="text-sm">
                                <p className="font-semibold">Num: {dockInfo.num}</p>
                                <p>HBL: {dockInfo.hbl}</p>
                                <p>CNTR: {dockInfo.cntr}</p>
                              </div>
                            ) : (
                              <p className="text-sm">No assignment</p>
                            )
                          })()}
                        </TooltipContent>
                      </Tooltip>
                    )
                  ))}
                </div>
              ))}
            </div>
          </TooltipProvider>
          
          {/* Dock Status Options */}
          {editMode && selectedDock && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Change Dock {selectedDock} Status
              </h4>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleDockStatusChange(selectedDock, 'available')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Available
                </Button>
                <Button
                  onClick={() => handleDockStatusChange(selectedDock, 'disabled')}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  Disable
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Schedule Data</CardTitle>
              <CardDescription>Current schedule items loaded from Excel</CardDescription>
            </div>
            <Button
              onClick={handleDownloadExcel}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Num</TableHead>
                  <TableHead>Dock</TableHead>
                  <TableHead>HBL</TableHead>
                  <TableHead>CNTR</TableHead>
                  <TableHead className="text-center">
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
                  <TableHead>Location</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Status Color</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleData.map((item, index) => (
                  <TableRow 
                    key={item.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleScheduleItemClick(item)}
                  >
                    <TableCell className="text-center font-medium text-gray-600">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.dock && item.dock.trim() !== '' ? (
                        <span className="px-3 py-1.5 rounded bg-gray-200 text-gray-700 border border-gray-300 font-medium">
                          {item.dock}
                        </span>
                      ) : item.checkInTime && item.checkInTime.trim() !== '' ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Check In된 항목에 Dock 할당을 위한 로직
                            setSelectedScheduleItem(item)
                            console.log('Ready to assign dock for item:', item.id)
                          }}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors"
                        >
                          Checked-In
                        </Button>
                      ) : (
                        <span className="px-3 py-1.5 rounded bg-gray-100 text-gray-400 text-sm italic">
                          Need Check In
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{item.hbl}</TableCell>
                    <TableCell>{item.cntr}</TableCell>
                    <TableCell className="text-center">{item.appointmentTime}</TableCell>
                    <TableCell>
                      {item.dock && item.dock.trim() !== '' ? (
                        // Dock이 할당된 경우: Selection toggle
                        <Select
                          value={(item.location && item.location.trim() !== '') ? item.location : "stage"}
                          onValueChange={(value) => handleLocationSelect(item.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 text-sm">
                            <SelectValue placeholder="Select location">
                              {(item.location && item.location.trim() !== '') ? item.location : "Stage"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stage">Stage</SelectItem>
                            {availableLocations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        // Dock이 할당되지 않은 경우: 빈 값 표시
                        <span className="text-sm text-gray-400 italic">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {/* Progress: Supervisor Tasks 진행 상태 */}
                      <div className="flex items-center gap-1">
                        {supervisorTodos.map((todo) => {
                          const isCompleted = item.supervisorTasksCompleted?.includes(todo.id)
                          return (
                            <div
                              key={todo.id}
                              className={`w-3 h-3 rounded-full ${
                                isCompleted ? getStatusColor(item.status) : 'bg-gray-300'
                              }`}
                              title={`${todo.text}: ${isCompleted ? 'Completed' : 'Pending'}`}
                            />
                          )
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        item.type === 'Cell' 
                          ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                          : 'bg-orange-100 text-orange-700 border border-orange-300'
                      }`}>
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.status}
                        onValueChange={(value: "free" | "unloading" | "hold") =>
                          handleStatusChange(item.id, value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="unloading">Unloading</SelectItem>
                          <SelectItem value="hold">Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="w-full flex justify-center">
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}
                          title={item.status}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {item.note || <span className="text-gray-400 italic">No note</span>}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {scheduleData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No schedule data available. Please upload an Excel file.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Available */}
      <Card>
        <CardHeader>
          <CardTitle>Location Available</CardTitle>
          <CardDescription>
            Available locations (managed in Inbound → Location)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 justify-center">
            {availableLocations.map((location) => (
              <div
                key={location}
                className="px-4 py-2 border-2 rounded-lg border-green-300 bg-green-50 text-green-700 font-medium"
              >
                {location}
              </div>
            ))}
            
            {availableLocations.length === 0 && (
              <div className="text-center py-4 text-muted-foreground w-full">
                No locations available. Go to Inbound → Location to manage locations.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
