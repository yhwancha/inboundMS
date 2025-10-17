"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Download, Check, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  readExcelFile, 
  findRowsByMColumnValue, 
  getMColumnUniqueValues,
  ExcelSheetInfo,
  ExcelRow 
} from "@/lib/excel-parser"
import * as XLSX from 'xlsx'

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
}

export default function ManageSchedulePage() {
  const router = useRouter()
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([])
  
  // Excel 관련 상태
  const [excelSheets, setExcelSheets] = useState<ExcelSheetInfo[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>("")
  const [mColumnDates, setMColumnDates] = useState<Date[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [searchResults, setSearchResults] = useState<ExcelRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoading(true)
      try {
        const sheets = await readExcelFile(file)
        setExcelSheets(sheets)
        console.log('Excel file loaded:', sheets.map(s => s.name))
      } catch (error) {
        console.error('Error reading Excel file:', error)
        alert('Excel 파일을 읽는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  // 날짜 문자열을 Date 객체로 변환하는 함수
  const parseDateFromString = (dateString: string | number): Date | null => {
    if (!dateString) return null
    
    const str = String(dateString).trim()
    console.log(`Parsing date string: "${str}"`)
    
    // MM/DD/YYYY 형식 파싱
    const mmddyyyyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (mmddyyyyMatch) {
      const [, month, day, year] = mmddyyyyMatch
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      console.log(`MM/DD/YYYY match: ${month}/${day}/${year} -> ${date}`)
      return date
    }
    
    // YYYY-MM-DD 형식 파싱
    const yyyymmddMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    if (yyyymmddMatch) {
      const [, year, month, day] = yyyymmddMatch
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      console.log(`YYYY-MM-DD match: ${year}-${month}-${day} -> ${date}`)
      return date
    }
    
    // MM-DD-YYYY 형식 파싱
    const mmddyyyyMatch2 = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
    if (mmddyyyyMatch2) {
      const [, month, day, year] = mmddyyyyMatch2
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      console.log(`MM-DD-YYYY match: ${month}-${day}-${year} -> ${date}`)
      return date
    }
    
    // Excel 날짜 숫자 형식 (1900년 기준)
    if (typeof dateString === 'number') {
      if (dateString > 1) { // Excel 날짜 숫자 범위
        // Excel 날짜는 1900년 1월 1일부터의 일수
        const excelEpoch = new Date(1900, 0, 1)
        const date = new Date(excelEpoch.getTime() + (dateString - 2) * 24 * 60 * 60 * 1000)
        if (!isNaN(date.getTime())) {
          console.log(`Excel number parsing: ${dateString} -> ${date}`)
          return date
        }
      }
    }
    
    // 일반 Date 생성자 시도
    const date = new Date(str)
    if (!isNaN(date.getTime())) {
      console.log(`Date constructor success: "${str}" -> ${date}`)
      return date
    }
    
    console.log(`Failed to parse date: "${str}"`)
    return null
  }

  // 날짜를 문자열로 포맷하는 함수
  const formatDateToString = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheet(sheetName)
    setSelectedDate(undefined)
    setSearchResults([])
    
    // 해당 시트의 M 컬럼에서 날짜들을 추출
    const sheet = excelSheets.find(s => s.name === sheetName)
    if (sheet) {
      const uniqueDates = new Set<string>()
      const allMValues: (string | number)[] = []
      
      console.log(`Processing sheet: ${sheetName}`)
      console.log(`Sheet has ${sheet.data.length} rows`)
      
      // 먼저 첫 몇 행의 데이터를 확인해서 M 컬럼 위치 찾기
      console.log('First few rows to find M column:')
      for (let i = 0; i < Math.min(5, sheet.data.length); i++) {
        console.log(`Row ${i + 1}:`, sheet.data[i])
      }
      
      // M 컬럼 (13번째 컬럼, 0-based index 12)에서 날짜 찾기
      sheet.data.forEach((row, rowIndex) => {
        const mColumnValue = row[12] // M 컬럼 (0-based index 12)
        allMValues.push(mColumnValue)
        
        if (mColumnValue !== undefined && mColumnValue !== null && mColumnValue !== '') {
          console.log(`Row ${rowIndex + 1}, M column (index 12) value:`, mColumnValue, typeof mColumnValue)
          
          // 더 간단한 날짜 파싱 시도
          let parsedDate: Date | null = null
          
          // MM/DD/YYYY 형식 직접 시도
          if (typeof mColumnValue === 'string') {
            const match = mColumnValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
            if (match) {
              const [, month, day, year] = match
              parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
              console.log(`Direct MM/DD/YYYY parsing: ${mColumnValue} -> ${parsedDate}`)
            }
          }
          
          // Excel 날짜 숫자인 경우
          if (!parsedDate && typeof mColumnValue === 'number') {
            if (mColumnValue > 1) { // Excel 날짜 숫자 범위 (더 넓게)
              // Excel 날짜는 1900년 1월 1일부터의 일수
              const excelEpoch = new Date(1900, 0, 1)
              const date = new Date(excelEpoch.getTime() + (mColumnValue - 2) * 24 * 60 * 60 * 1000)
              if (!isNaN(date.getTime())) {
                parsedDate = date
                console.log(`Excel number parsing: ${mColumnValue} -> ${parsedDate}`)
              }
            }
          }
          
          if (parsedDate && !isNaN(parsedDate.getTime())) {
            const dateStr = formatDateToString(parsedDate)
            uniqueDates.add(dateStr)
            console.log(`Successfully parsed: ${mColumnValue} -> ${dateStr}`)
          } else {
            console.log(`Failed to parse date: ${mColumnValue}`)
          }
        }
      })
      
      // M 컬럼에서 날짜를 찾지 못했다면 다른 컬럼들도 확인
      if (uniqueDates.size === 0) {
        console.log('No dates found in M column, checking other columns...')
        for (let colIndex = 0; colIndex < Math.min(20, sheet.data[0]?.length || 0); colIndex++) {
          const colDates = new Set<string>()
          
          sheet.data.forEach((row, rowIndex) => {
            const cellValue = row[colIndex]
            if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
              const parsedDate = parseDateFromString(cellValue)
              if (parsedDate) {
                const dateStr = formatDateToString(parsedDate)
                colDates.add(dateStr)
                console.log(`Column ${String.fromCharCode(65 + colIndex)} (index ${colIndex}), Row ${rowIndex + 1}: ${cellValue} -> ${dateStr}`)
              }
            }
          })
          
          if (colDates.size > 0) {
            console.log(`Found ${colDates.size} dates in column ${String.fromCharCode(65 + colIndex)} (index ${colIndex})`)
            colDates.forEach(date => uniqueDates.add(date))
          }
        }
      }
      
      console.log('All M column values:', allMValues)
      console.log('Unique date strings:', Array.from(uniqueDates))
      
      // 실제 파싱된 날짜들 상세 출력
      console.log('=== PARSED DATES DETAIL ===')
      uniqueDates.forEach(date => {
        console.log(`Available date: ${date}`)
      })
      
      const dates = Array.from(uniqueDates)
        .map(dateStr => parseDateFromString(dateStr))
        .filter((date): date is Date => date !== null)
        .sort((a, b) => a.getTime() - b.getTime())
      
      setMColumnDates(dates)
      console.log('Final parsed dates:', dates.map(d => formatDateToString(d)))
    }
  }

  // Excel 검색 결과를 Schedule 데이터로 변환하는 함수
  const convertExcelRowsToScheduleData = (excelRows: ExcelRow[]): ScheduleItem[] => {
    return excelRows.map((row, index) => {
      // Excel 행 데이터에서 필요한 정보 추출 (컬럼 위치에 따라 조정 필요)
      const data = row.data
      
      // N 컬럼(인덱스 13)의 appointment time을 시간 형식으로 변환
      let appointmentTime = "09:00" // 기본값
      const nColumnValue = data[13] // N 컬럼
      
      console.log(`Row ${row.rowIndex}, N column (index 13) value:`, nColumnValue, typeof nColumnValue)
      
      if (nColumnValue !== undefined && nColumnValue !== null && nColumnValue !== '') {
        // Excel 시간 숫자인 경우 (0.0 ~ 1.0 범위)
        if (typeof nColumnValue === 'number' && nColumnValue >= 0 && nColumnValue <= 1) {
          // Excel 시간을 실제 시간으로 변환
          const totalMinutes = Math.round(nColumnValue * 24 * 60)
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          
          // 12시간 형식으로 변환
          let displayHours = hours
          let ampm = 'AM'
          
          if (hours === 0) {
            displayHours = 12
          } else if (hours === 12) {
            ampm = 'PM'
          } else if (hours > 12) {
            displayHours = hours - 12
            ampm = 'PM'
          }
          
          appointmentTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
          console.log(`Converted Excel time: ${nColumnValue} -> ${appointmentTime}`)
        }
        // 이미 시간 형식 문자열인 경우 그대로 사용
        else if (typeof nColumnValue === 'string') {
          appointmentTime = nColumnValue
          console.log(`Using string time: ${nColumnValue} -> ${appointmentTime}`)
        }
        // 다른 숫자인 경우 그대로 사용
        else {
          appointmentTime = String(nColumnValue)
          console.log(`Using other value: ${nColumnValue} -> ${appointmentTime}`)
        }
      } else {
        console.log(`N column is empty or undefined for row ${row.rowIndex}`)
      }
      
      return {
        id: `excel-${row.rowIndex}`,
        dock: "", // Dock은 빈 값으로 시작
        hbl: data[2] || `HBL${row.rowIndex}`, // C 컬럼 (HBL)
        cntr: data[3] || `CNTR${row.rowIndex}`, // D 컬럼 (CNTR로 변경)
        appointmentTime: appointmentTime, // N 컬럼(인덱스 13)에서 변환된 시간
        location: "stage", // 기본값은 항상 stage
        note: data[14] || "", // O 컬럼 (N 다음 컬럼)
        status: "free" as const, // 기본값
        type: (index % 2 === 0 ? "Cell" : "Pack") as const // 기본값
      }
    })
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    
    if (!date) {
      setSearchResults([])
      setScheduleData([])
      return
    }
    
    // 선택된 시트에서 해당 날짜를 가진 row들을 찾음
    const sheet = excelSheets.find(s => s.name === selectedSheet)
    if (sheet) {
      const targetDateStr = formatDateToString(date)
      const results = findRowsByMColumnValue(sheet.data, targetDateStr)
      setSearchResults(results)
      
      // 검색 결과를 Schedule 데이터로 변환
      const scheduleItems = convertExcelRowsToScheduleData(results)
      setScheduleData(scheduleItems)
      
      console.log(`Found ${results.length} rows with M column date "${targetDateStr}":`, results)
      console.log(`Converted to ${scheduleItems.length} schedule items:`, scheduleItems)
      
      // 디버깅: M 컬럼의 모든 값 확인
      if (results.length === 0) {
        console.log('No matching rows found. Checking all M column values...')
        sheet.data.forEach((row, index) => {
          const mValue = row[12]
          if (mValue !== undefined && mValue !== null && mValue !== '') {
            console.log(`Row ${index + 1}, M column: "${mValue}" (${typeof mValue})`)
          }
        })
      }
    }
  }

  const handleExportExcel = () => {
    if (scheduleData.length === 0) {
      alert('내보낼 데이터가 없습니다.')
      return
    }

    try {
      // 워크북 생성
      const workbook = XLSX.utils.book_new()
      
      // 데이터를 워크시트로 변환
      const worksheetData = [
        // 헤더 행
        ['Dock', 'HBL', 'Cont Num', 'Appointment Time', 'Location', 'Type', 'Status', 'Note'],
        // 데이터 행들
        ...scheduleData.map(item => [
          item.dock,
          item.hbl,
          item.contNum,
          item.appointmentTime,
          item.location,
          item.type,
          item.status,
          item.note
        ])
      ]
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      
      // 워크시트를 워크북에 추가
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule Data')
      
      // Excel 파일 다운로드
      const fileName = `schedule_data_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
      
      console.log(`Excel 파일이 다운로드되었습니다: ${fileName}`)
    } catch (error) {
      console.error('Excel 내보내기 중 오류 발생:', error)
      alert('Excel 파일을 내보내는 중 오류가 발생했습니다.')
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

  const handleConfirmSchedule = () => {
    if (scheduleData.length === 0) {
      alert('확인할 스케줄 데이터가 없습니다.')
      return
    }

    if (!selectedDate) {
      alert('날짜를 선택해주세요.')
      return
    }

    // Schedule 데이터를 localStorage에 저장 (Dock은 빈 값으로 시작)
    const scheduleDataWithDock = scheduleData.map((item) => ({
      ...item,
      dock: "", // Dock은 빈 값으로 시작
      checkInTime: "" // Check In 시간도 빈 값으로 시작
    }))

    const dateStr = formatDateToString(selectedDate)
    
    // 날짜별로 데이터 저장 (confirmedScheduleData_날짜 형식)
    localStorage.setItem(`confirmedScheduleData_${dateStr}`, JSON.stringify(scheduleDataWithDock))
    localStorage.setItem('confirmedScheduleDate', selectedDate.toISOString())

    // Schedule List에 추가
    const existingList = JSON.parse(localStorage.getItem('scheduleList') || '[]')
    
    // 같은 날짜가 이미 있으면 업데이트, 없으면 추가
    const existingIndex = existingList.findIndex((item: any) => item.date === dateStr)
    const newItem = {
      date: dateStr,
      count: scheduleDataWithDock.length, // 실제 데이터 개수
      lastUpdated: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    if (existingIndex >= 0) {
      existingList[existingIndex] = newItem
    } else {
      existingList.push(newItem)
    }

    localStorage.setItem('scheduleList', JSON.stringify(existingList))

    // Schedule 페이지에서 사용할 수 있도록 confirmedScheduleData에 저장
    localStorage.setItem('confirmedScheduleData', JSON.stringify(scheduleDataWithDock))
    
    alert(`${scheduleData.length}개의 스케줄 데이터가 확인되었습니다. Schedule 페이지로 이동합니다.`)
    
    // Schedule 페이지로 직접 이동
    router.push('/schedule')
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
        <h1 className="text-3xl font-bold text-foreground">Manage Schedule</h1>
      </div>

      {/* Import Schedule Data */}
      <Card>
        <CardHeader>
          <CardTitle>Import Schedule Data</CardTitle>
          <CardDescription>Upload Excel file to import schedule data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="excel-file" className="sr-only">
                Upload Excel file
              </Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="cursor-pointer"
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleExportExcel} variant="outline" disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
          
          {isLoading && (
            <p className="text-sm text-blue-600">Excel 파일을 읽는 중...</p>
          )}
          
          <p className="text-sm text-muted-foreground">
            Supported formats: .xlsx, .xls
          </p>
          
          {/* Excel 시트 선택 */}
          {excelSheets.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <div>
                <Label className="text-sm font-medium">Excel 시트 선택</Label>
                <Select value={selectedSheet} onValueChange={handleSheetSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="시트를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {excelSheets.map((sheet) => (
                      <SelectItem key={sheet.name} value={sheet.name}>
                        {sheet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* M 컬럼 날짜 선택 */}
              {selectedSheet && mColumnDates.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">M 컬럼 날짜 선택</Label>
                  <Select 
                    value={selectedDate ? formatDateToString(selectedDate) : ""} 
                    onValueChange={(value) => {
                      const date = parseDateFromString(value)
                      handleDateSelect(date)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="날짜를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {mColumnDates.map((date) => (
                        <SelectItem key={formatDateToString(date)} value={formatDateToString(date)}>
                          {formatDateToString(date)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    총 {mColumnDates.length}개의 날짜가 있습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Excel Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Excel 검색 결과</CardTitle>
            <CardDescription>
              시트 "{selectedSheet}"에서 M 컬럼 날짜 "{selectedDate ? formatDateToString(selectedDate) : ''}"를 가진 {searchResults.length}개의 행을 찾았습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row #</TableHead>
                    <TableHead>A</TableHead>
                    <TableHead>B</TableHead>
                    <TableHead>C</TableHead>
                    <TableHead>D</TableHead>
                    <TableHead>E</TableHead>
                    <TableHead>F</TableHead>
                    <TableHead>G</TableHead>
                    <TableHead>H</TableHead>
                    <TableHead>I</TableHead>
                    <TableHead>J</TableHead>
                    <TableHead>K</TableHead>
                    <TableHead>L</TableHead>
                    <TableHead className="bg-blue-100">M (검색값)</TableHead>
                    <TableHead>N</TableHead>
                    <TableHead>O</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{result.rowIndex}</TableCell>
                      {result.data.slice(0, 15).map((cell, cellIndex) => (
                        <TableCell 
                          key={cellIndex}
                          className={cellIndex === 12 ? "bg-blue-50 font-medium" : ""}
                        >
                          {cell !== undefined && cell !== null ? String(cell) : ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manage Schedule Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Schedule Data</CardTitle>
              <CardDescription>
                {selectedDate 
                  ? `선택된 날짜 (${formatDateToString(selectedDate)})의 스케줄 데이터 - 총 ${scheduleData.length}개 항목`
                  : "날짜를 선택하면 해당 날짜의 스케줄 데이터가 표시됩니다"
                }
              </CardDescription>
            </div>
            {scheduleData.length > 0 && selectedDate && (
              <Button 
                onClick={handleConfirmSchedule}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
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
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Status Color</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.hbl}</TableCell>
                    <TableCell>{item.cntr}</TableCell>
                    <TableCell>{item.appointmentTime}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        item.type === 'Cell' 
                          ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                          : 'bg-orange-100 text-orange-700 border border-orange-300'
                      }`}>
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="w-full flex justify-center">
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}
                          title={item.status}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{item.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {scheduleData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {selectedSheet 
                ? "날짜를 선택하면 해당 날짜의 스케줄 데이터가 표시됩니다."
                : "Excel 파일을 업로드하고 시트를 선택한 후 날짜를 선택해주세요."
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

