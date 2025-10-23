"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, Trash2, CheckCircle2, AlertCircle, Calendar as CalendarIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ExcelFile {
  id: string
  file: File
  name: string
  size: string
  uploadedAt: Date
  columns: string[]
  selectedDateColumn: string
  selectedDate: string
  previewData: any[][]
}

export default function ScheduleExcelPage() {
  const [excelFiles, setExcelFiles] = useState<ExcelFile[]>([])
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newFiles: ExcelFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Check if file is Excel
      const isExcel = 
        file.name.endsWith('.xlsx') || 
        file.name.endsWith('.xls') || 
        file.name.endsWith('.csv')

      if (!isExcel) {
        setUploadStatus({
          type: "error",
          message: `${file.name}은(는) Excel 파일이 아닙니다. (.xlsx, .xls, .csv만 가능)`
        })
        continue
      }

      // Check if we already have 3 files
      if (excelFiles.length + newFiles.length >= 3) {
        setUploadStatus({
          type: "error",
          message: "최대 3개의 파일만 업로드할 수 있습니다."
        })
        break
      }

      const fileSize = (file.size / 1024 / 1024).toFixed(2) // MB

      // Read Excel file to get columns
      try {
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
        
        // Get column headers (first row)
        const headers = jsonData[0] || []
        const columns = headers.map((h: any) => String(h))
        
        // Get preview data (first 5 rows including header)
        const previewData = jsonData.slice(0, 6)

        newFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          name: file.name,
          size: `${fileSize} MB`,
          uploadedAt: new Date(),
          columns,
          selectedDateColumn: "",
          selectedDate: "",
          previewData
        })
      } catch (error) {
        console.error("Error reading Excel file:", error)
        setUploadStatus({
          type: "error",
          message: `${file.name} 파일을 읽는 중 오류가 발생했습니다.`
        })
      }
    }

    if (newFiles.length > 0) {
      setExcelFiles([...excelFiles, ...newFiles])
      setUploadStatus({
        type: "success",
        message: `${newFiles.length}개의 파일이 추가되었습니다.`
      })
    }

    // Reset input
    event.target.value = ""
  }

  const handleRemoveFile = (id: string) => {
    setExcelFiles(excelFiles.filter(f => f.id !== id))
    setUploadStatus({
      type: "success",
      message: "파일이 제거되었습니다."
    })
  }

  const handleClearAll = () => {
    setExcelFiles([])
    setUploadStatus({
      type: "success",
      message: "모든 파일이 제거되었습니다."
    })
  }

  const handleDateColumnChange = (fileId: string, column: string) => {
    setExcelFiles(excelFiles.map(f => 
      f.id === fileId ? { ...f, selectedDateColumn: column } : f
    ))
  }

  const handleDateChange = (fileId: string, date: string) => {
    setExcelFiles(excelFiles.map(f => 
      f.id === fileId ? { ...f, selectedDate: date } : f
    ))
  }

  const handleExtractData = async () => {
    // Validate all files have date column and date selected
    const incomplete = excelFiles.find(f => !f.selectedDateColumn || !f.selectedDate)
    if (incomplete) {
      setUploadStatus({
        type: "error",
        message: "모든 파일에 대해 날짜 컬럼과 날짜를 선택해주세요."
      })
      return
    }

    try {
      const allSchedules: any[] = []
      
      // Extract data from each file
      for (const file of excelFiles) {
        const data = await file.file.arrayBuffer()
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]
        
        // Find column index for date
        const dateColumnIndex = file.columns.indexOf(file.selectedDateColumn)
        
        // Filter rows by selected date
        const filteredRows = jsonData.filter((row: any) => {
          const rowDate = row[file.selectedDateColumn]
          if (!rowDate) return false
          
          // Convert Excel date to string if needed
          let dateString = String(rowDate)
          if (typeof rowDate === 'number') {
            // Excel serial date to JS date
            const date = new Date((rowDate - 25569) * 86400 * 1000)
            dateString = date.toISOString().split('T')[0]
          }
          
          return dateString.includes(file.selectedDate) || 
                 dateString === file.selectedDate
        })
        
        // Map to schedule format
        filteredRows.forEach((row: any, index: number) => {
          allSchedules.push({
            date: file.selectedDate,
            appointmentTime: row['Appointment Time'] || row['Time'] || `${9 + index}:00`,
            locationId: row['Location'] || row['Dock'] || 'stage',
            clientName: row['Client Name'] || row['Name'] || row['HBL'] || `Client ${index + 1}`,
            phoneNumber: row['Phone'] || row['Contact'] || '000-0000-0000',
            serviceType: row['Service'] || row['Type'] || 'Standard',
            notes: row['Notes'] || row['Note'] || ''
          })
        })
      }
      
      if (allSchedules.length === 0) {
        setUploadStatus({
          type: "error",
          message: "선택한 날짜의 데이터가 없습니다."
        })
        return
      }
      
      // Send to Backend API
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: allSchedules })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save schedules')
      }
      
      const result = await response.json()
      
      setUploadStatus({
        type: "success",
        message: `${result.count}개의 스케줄이 저장되었습니다!`
      })
      
      // Clear files after successful upload
      setTimeout(() => {
        setExcelFiles([])
      }, 2000)
      
    } catch (error) {
      console.error('Error extracting data:', error)
      setUploadStatus({
        type: "error",
        message: "데이터 추출 중 오류가 발생했습니다."
      })
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const remainingSlots = 3 - excelFiles.length
  const canExtract = excelFiles.length > 0 && excelFiles.every(f => f.selectedDateColumn && f.selectedDate)

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Schedule Excel Insert</h2>
          <p className="text-muted-foreground mt-2">
            최대 3개의 Excel 파일을 업로드할 수 있습니다
          </p>
        </div>
      </div>

      {/* Status Alert */}
      {uploadStatus.type && (
        <Alert variant={uploadStatus.type === "error" ? "destructive" : "default"}>
          {uploadStatus.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{uploadStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>파일 업로드</CardTitle>
          <CardDescription>
            Excel 파일을 선택하여 업로드하세요 (.xlsx, .xls, .csv)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              id="excel-upload"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              multiple
              onChange={handleFileChange}
              disabled={excelFiles.length >= 3}
            />
            <label
              htmlFor="excel-upload"
              className={`cursor-pointer ${excelFiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {excelFiles.length >= 3 
                      ? "최대 파일 수에 도달했습니다" 
                      : "클릭하여 Excel 파일 선택"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {remainingSlots > 0 
                      ? `${remainingSlots}개의 파일을 더 추가할 수 있습니다`
                      : "파일을 추가하려면 기존 파일을 삭제하세요"}
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* File List */}
          {excelFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  업로드된 파일 ({excelFiles.length}/3)
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearAll}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  모두 삭제
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {excelFiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>업로드된 파일이 없습니다</p>
              <p className="text-sm mt-1">위의 업로드 영역을 클릭하여 파일을 추가하세요</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Configuration Cards */}
      {excelFiles.map((file, index) => (
        <Card key={file.id} className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                      파일 #{index + 1}
                    </span>
                    <CardTitle className="text-base">{file.name}</CardTitle>
                  </div>
                  <CardDescription className="mt-1">
                    {file.size} • {file.columns.length}개 컬럼 • {formatDate(file.uploadedAt)}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFile(file.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Column Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`date-column-${file.id}`}>
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  날짜 컬럼 선택
                </Label>
                <Select
                  value={file.selectedDateColumn}
                  onValueChange={(value) => handleDateColumnChange(file.id, value)}
                >
                  <SelectTrigger id={`date-column-${file.id}`}>
                    <SelectValue placeholder="날짜가 포함된 컬럼을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {file.columns.map((col, idx) => (
                      <SelectItem key={idx} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`date-value-${file.id}`}>
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  추출할 날짜
                </Label>
                <Input
                  id={`date-value-${file.id}`}
                  type="date"
                  value={file.selectedDate}
                  onChange={(e) => handleDateChange(file.id, e.target.value)}
                  placeholder="날짜를 선택하세요"
                />
              </div>
            </div>

            {/* Preview Data */}
            {file.previewData.length > 0 && (
              <div className="space-y-2">
                <Label>데이터 미리보기 (최대 5행)</Label>
                <div className="border rounded-lg overflow-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {file.previewData[0]?.map((header: any, idx: number) => (
                          <th
                            key={idx}
                            className={`px-3 py-2 text-left font-semibold whitespace-nowrap ${
                              String(header) === file.selectedDateColumn
                                ? "bg-primary/20 text-primary"
                                : ""
                            }`}
                          >
                            {String(header)}
                            {String(header) === file.selectedDateColumn && (
                              <CalendarIcon className="w-3 h-3 inline ml-1" />
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {file.previewData.slice(1, 6).map((row: any[], rowIdx: number) => (
                        <tr key={rowIdx} className="border-t hover:bg-accent/50">
                          {row.map((cell: any, cellIdx: number) => (
                            <td
                              key={cellIdx}
                              className={`px-3 py-2 whitespace-nowrap ${
                                file.previewData[0]?.[cellIdx] === file.selectedDateColumn
                                  ? "bg-primary/5 font-medium"
                                  : ""
                              }`}
                            >
                              {String(cell || "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-sm">
              {file.selectedDateColumn && file.selectedDate ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    설정 완료: "{file.selectedDateColumn}" 컬럼에서 {file.selectedDate} 날짜의 데이터를 추출합니다
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-600">
                    {!file.selectedDateColumn && !file.selectedDate && "날짜 컬럼과 날짜를 선택해주세요"}
                    {file.selectedDateColumn && !file.selectedDate && "날짜를 선택해주세요"}
                    {!file.selectedDateColumn && file.selectedDate && "날짜 컬럼을 선택해주세요"}
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Extract Data Button */}
      {excelFiles.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleExtractData}
              disabled={!canExtract}
              className="w-full h-12 text-base"
              size="lg"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {canExtract ? "데이터 추출 및 처리" : "모든 파일 설정을 완료해주세요"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

