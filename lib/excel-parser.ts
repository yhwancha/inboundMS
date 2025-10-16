import * as XLSX from 'xlsx'

export interface ExcelSheetInfo {
  name: string
  data: any[][]
}

export interface ExcelRow {
  rowIndex: number
  data: any[]
}

/**
 * Excel 파일에서 모든 시트 정보를 읽어옵니다
 */
export function readExcelFile(file: File): Promise<ExcelSheetInfo[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        const sheets: ExcelSheetInfo[] = []
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
          sheets.push({
            name: sheetName,
            data: jsonData
          })
        })
        
        resolve(sheets)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Excel 날짜 숫자를 실제 날짜로 변환하는 함수
 */
function excelNumberToDate(excelNumber: number): Date | null {
  if (excelNumber > 1) {
    const excelEpoch = new Date(1900, 0, 1)
    const date = new Date(excelEpoch.getTime() + (excelNumber - 2) * 24 * 60 * 60 * 1000)
    return !isNaN(date.getTime()) ? date : null
  }
  return null
}

/**
 * 날짜를 MM/DD/YYYY 형식 문자열로 변환하는 함수
 */
function formatDateToString(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

/**
 * 특정 시트의 M 컬럼(13번째 컬럼)에서 특정 값을 가진 row들을 찾습니다
 */
export function findRowsByMColumnValue(
  sheetData: any[][],
  targetValue: string | number
): ExcelRow[] {
  const results: ExcelRow[] = []
  
  sheetData.forEach((row, rowIndex) => {
    // M 컬럼은 13번째 컬럼 (0-based index로 12)
    const mColumnValue = row[12] // M 컬럼
    
    // 직접 비교
    if (mColumnValue === targetValue || 
        String(mColumnValue).trim() === String(targetValue).trim()) {
      results.push({
        rowIndex: rowIndex + 1, // 1-based row number
        data: row
      })
    }
    // Excel 날짜 숫자인 경우 변환 후 비교
    else if (typeof mColumnValue === 'number' && typeof targetValue === 'string') {
      const convertedDate = excelNumberToDate(mColumnValue)
      if (convertedDate) {
        const formattedDate = formatDateToString(convertedDate)
        if (formattedDate === targetValue) {
          results.push({
            rowIndex: rowIndex + 1,
            data: row
          })
        }
      }
    }
  })
  
  return results
}

/**
 * 특정 시트에서 M 컬럼의 모든 고유값을 가져옵니다
 */
export function getMColumnUniqueValues(sheetData: any[][]): (string | number)[] {
  const uniqueValues = new Set<string | number>()
  
  sheetData.forEach(row => {
    const mColumnValue = row[12] // M 컬럼
    
    if (mColumnValue !== undefined && mColumnValue !== null && mColumnValue !== '') {
      uniqueValues.add(mColumnValue)
    }
  })
  
  return Array.from(uniqueValues).sort()
}

/**
 * 시트에서 헤더 행을 찾습니다 (보통 첫 번째 행이지만, 빈 셀이 많은 경우를 고려)
 */
export function findHeaderRow(sheetData: any[][]): number {
  for (let i = 0; i < Math.min(5, sheetData.length); i++) {
    const row = sheetData[i]
    const nonEmptyCells = row.filter(cell => 
      cell !== undefined && cell !== null && cell !== ''
    ).length
    
    // 비어있지 않은 셀이 3개 이상이면 헤더로 간주
    if (nonEmptyCells >= 3) {
      return i
    }
  }
  
  return 0 // 기본값으로 첫 번째 행
}

/**
 * 특정 시트의 데이터를 테이블 형태로 변환합니다
 */
export function convertSheetToTable(sheetData: any[][], headerRowIndex: number = 0): any[] {
  if (sheetData.length <= headerRowIndex) return []
  
  const headers = sheetData[headerRowIndex]
  const rows = sheetData.slice(headerRowIndex + 1)
  
  return rows.map(row => {
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = row[index]
    })
    return obj
  })
}
