"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Download, X, Check, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ExcelData {
  fileName: string
  data: any[]
  headers: string[]
}

export default function ExcelComparePage() {
  const router = useRouter()
  const [file1, setFile1] = useState<ExcelData | null>(null)
  const [file2, setFile2] = useState<ExcelData | null>(null)
  const [compareResult, setCompareResult] = useState<{
    onlyInFile1: any[]
    onlyInFile2: any[]
    common: any[]
    differences: any[]
  } | null>(null)
  const [compareKey, setCompareKey] = useState<string>('')

  const handleFileUpload = (fileNumber: 1 | 2, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        if (jsonData.length > 0) {
          const headers = Object.keys(jsonData[0] as any)
          const excelData: ExcelData = {
            fileName: file.name,
            data: jsonData,
            headers
          }
          
          if (fileNumber === 1) {
            setFile1(excelData)
            setCompareResult(null)
          } else {
            setFile2(excelData)
            setCompareResult(null)
          }

          // 첫 번째 컬럼을 기본 비교 키로 설정
          if (!compareKey && headers.length > 0) {
            setCompareKey(headers[0])
          }
        }
      } catch (error) {
        console.error('Error reading Excel file:', error)
        alert('Failed to read Excel file. Please try again.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleCompare = () => {
    if (!file1 || !file2 || !compareKey) {
      alert('Please upload both files and select a compare key.')
      return
    }

    // 비교 키를 기준으로 데이터 비교
    const map1 = new Map(file1.data.map(row => [row[compareKey], row]))
    const map2 = new Map(file2.data.map(row => [row[compareKey], row]))

    const onlyInFile1: any[] = []
    const onlyInFile2: any[] = []
    const common: any[] = []
    const differences: any[] = []

    // File1에만 있는 데이터 찾기
    map1.forEach((row, key) => {
      if (!map2.has(key)) {
        onlyInFile1.push(row)
      } else {
        common.push({ key, file1: row, file2: map2.get(key) })
        
        // 차이점 확인
        const row2 = map2.get(key)
        let hasDifference = false
        const diff: any = { [compareKey]: key }
        
        file1.headers.forEach(header => {
          if (row[header] !== row2[header]) {
            hasDifference = true
            diff[header] = {
              file1: row[header],
              file2: row2[header]
            }
          }
        })
        
        if (hasDifference) {
          differences.push(diff)
        }
      }
    })

    // File2에만 있는 데이터 찾기
    map2.forEach((row, key) => {
      if (!map1.has(key)) {
        onlyInFile2.push(row)
      }
    })

    setCompareResult({
      onlyInFile1,
      onlyInFile2,
      common,
      differences
    })
  }

  const handleRemoveFile = (fileNumber: 1 | 2) => {
    if (fileNumber === 1) {
      setFile1(null)
    } else {
      setFile2(null)
    }
    setCompareResult(null)
  }

  const handleDownloadResults = () => {
    if (!compareResult) return

    try {
      const wb = XLSX.utils.book_new()

      // Sheet 1: Only in File 1
      if (compareResult.onlyInFile1.length > 0) {
        const ws1 = XLSX.utils.json_to_sheet(compareResult.onlyInFile1)
        XLSX.utils.book_append_sheet(wb, ws1, 'Only in File 1')
      }

      // Sheet 2: Only in File 2
      if (compareResult.onlyInFile2.length > 0) {
        const ws2 = XLSX.utils.json_to_sheet(compareResult.onlyInFile2)
        XLSX.utils.book_append_sheet(wb, ws2, 'Only in File 2')
      }

      // Sheet 3: Differences
      if (compareResult.differences.length > 0) {
        const diffData = compareResult.differences.map(diff => {
          const row: any = {}
          Object.keys(diff).forEach(key => {
            if (typeof diff[key] === 'object' && diff[key].file1 !== undefined) {
              row[`${key}_File1`] = diff[key].file1
              row[`${key}_File2`] = diff[key].file2
            } else {
              row[key] = diff[key]
            }
          })
          return row
        })
        const ws3 = XLSX.utils.json_to_sheet(diffData)
        XLSX.utils.book_append_sheet(wb, ws3, 'Differences')
      }

      const fileName = `Excel_Compare_${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}.xlsx`
      XLSX.writeFile(wb, fileName)
    } catch (error) {
      console.error('Error downloading comparison results:', error)
      alert('Failed to download results. Please try again.')
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
        <h1 className="text-3xl font-bold text-foreground">Excel Sheet Compare</h1>
      </div>

      {/* File Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File 1 */}
        <Card>
          <CardHeader>
            <CardTitle>File 1</CardTitle>
            <CardDescription>Upload first Excel file to compare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!file1 ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="file1-upload"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => handleFileUpload(1, e)}
                />
                <label htmlFor="file1-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-12 h-12 text-primary" />
                    <div>
                      <p className="font-semibold text-lg">Click to upload</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Excel files only (.xlsx, .xls, .csv)
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">{file1.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {file1.data.length} rows, {file1.headers.length} columns
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFile(1)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File 2 */}
        <Card>
          <CardHeader>
            <CardTitle>File 2</CardTitle>
            <CardDescription>Upload second Excel file to compare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!file2 ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="file2-upload"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => handleFileUpload(2, e)}
                />
                <label htmlFor="file2-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-12 h-12 text-primary" />
                    <div>
                      <p className="font-semibold text-lg">Click to upload</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Excel files only (.xlsx, .xls, .csv)
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">{file2.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {file2.data.length} rows, {file2.headers.length} columns
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFile(2)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compare Key Selection */}
      {file1 && file2 && (
        <Card>
          <CardHeader>
            <CardTitle>Compare Settings</CardTitle>
            <CardDescription>Select the column to use as comparison key</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium">Compare Key:</label>
              <select
                value={compareKey}
                onChange={(e) => setCompareKey(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                {file1.headers.map(header => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleCompare}
              className="w-full"
              size="lg"
            >
              Compare Files
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {compareResult && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total in File 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{file1?.data.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total in File 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{file2?.data.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Common Rows</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{compareResult.common.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Differences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">{compareResult.differences.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Download Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleDownloadResults}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Comparison Results
            </Button>
          </div>

          {/* Only in File 1 */}
          {compareResult.onlyInFile1.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Only in File 1 ({compareResult.onlyInFile1.length} rows)</CardTitle>
                <CardDescription>Rows that exist only in the first file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {file1?.headers.map(header => (
                          <TableHead key={header}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compareResult.onlyInFile1.slice(0, 50).map((row, index) => (
                        <TableRow key={index}>
                          {file1?.headers.map(header => (
                            <TableCell key={header}>{String(row[header] || '')}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {compareResult.onlyInFile1.length > 50 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing first 50 rows. Download for complete results.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Only in File 2 */}
          {compareResult.onlyInFile2.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Only in File 2 ({compareResult.onlyInFile2.length} rows)</CardTitle>
                <CardDescription>Rows that exist only in the second file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {file2?.headers.map(header => (
                          <TableHead key={header}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compareResult.onlyInFile2.slice(0, 50).map((row, index) => (
                        <TableRow key={index}>
                          {file2?.headers.map(header => (
                            <TableCell key={header}>{String(row[header] || '')}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {compareResult.onlyInFile2.length > 50 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing first 50 rows. Download for complete results.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Differences */}
          {compareResult.differences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Rows with Differences ({compareResult.differences.length})</CardTitle>
                <CardDescription>Common rows with different values</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {compareResult.differences.slice(0, 10).map((diff, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-900/10">
                      <p className="font-semibold mb-2">
                        {compareKey}: {diff[compareKey]}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.keys(diff).filter(key => key !== compareKey).map(key => (
                          <div key={key} className="space-y-1">
                            <p className="font-medium">{key}:</p>
                            <p className="text-red-600">File 1: {String(diff[key].file1 || '')}</p>
                            <p className="text-blue-600">File 2: {String(diff[key].file2 || '')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {compareResult.differences.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Showing first 10 differences. Download for complete results.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* No Differences Message */}
          {compareResult.onlyInFile1.length === 0 && 
           compareResult.onlyInFile2.length === 0 && 
           compareResult.differences.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-600 mb-2">Files are identical!</h3>
                  <p className="text-muted-foreground">
                    Both files contain the same data with no differences.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

