import { jsPDF } from "jspdf"
import type { TimesheetData } from "./types"

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function formatTime(timeString: string): string {
  if (!timeString) return ""
  
  // If it's already in HH:MM format, return as is
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    return timeString
  }
  
  // If it's just a number like "11", convert to "11:00"
  if (/^\d{1,2}$/.test(timeString)) {
    const hour = timeString.padStart(2, '0')
    return `${hour}:00`
  }
  
  // If it's in HH:MM:SS format, remove seconds
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
    return timeString.replace(/:\d{2}$/, '')
  }
  
  // If it's in HHMM format, add colon
  if (/^\d{4}$/.test(timeString)) {
    return `${timeString.slice(0, 2)}:${timeString.slice(2)}`
  }
  
  // Default: return as is
  return timeString
}

function generateFallbackPDF(data: TimesheetData): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20

  doc.setFontSize(18)
  doc.setFont("helvetica")
  doc.text("TIMESHEET CORRECTION FORM", pageWidth / 2, 25, { align: "center" })

  // Employee Information Section
  let yPos = 45
  doc.setFontSize(11)
  doc.setFont("helvetica")
  doc.text("Employee Information", margin, yPos)

  yPos += 5
  const infoBoxHeight = 24
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.3)
  doc.rect(margin, yPos, pageWidth - 2 * margin, infoBoxHeight)

  // Vertical line to split columns
  doc.line(pageWidth / 2, yPos, pageWidth / 2, yPos + infoBoxHeight)

  // Horizontal line to split rows
  doc.line(margin, yPos + infoBoxHeight / 2, pageWidth - margin, yPos + infoBoxHeight / 2)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  // Row 1 - Left cell
  doc.text("Name", margin + 3, yPos + 7)
  doc.setFont("helvetica")
  doc.text(data.employeeName || "", margin + 20, yPos + 7)

  // Row 1 - Right cell
  doc.setFont("helvetica", "normal")
  doc.text("Employee #", pageWidth / 2 + 3, yPos + 7)
  doc.setFont("helvetica")
  doc.text(data.employeeNumber || "", pageWidth / 2 + 28, yPos + 7)

  // Row 2 - Left cell
  doc.setFont("helvetica", "normal")
  doc.text("Dept.", margin + 3, yPos + 19)
  doc.setFont("helvetica")
  doc.text(data.department || "", margin + 20, yPos + 19)

  // Row 2 - Right cell
  doc.setFont("helvetica", "normal")
  doc.text("Supervisor Name", pageWidth / 2 + 3, yPos + 19)
  doc.setFont("helvetica")
  doc.text(data.supervisorName || "", pageWidth / 2 + 38, yPos + 19)

  // Adjustments Section
  yPos += infoBoxHeight + 15
  doc.setFontSize(11)
  doc.setFont("helvetica")
  doc.text("Adjustments", margin, yPos)

  yPos += 5

  const tableTop = yPos
  const colWidths = [28, 24, 24, 28, 24, 52]
  const rowHeight = 9
  const numRows = 7

  // Draw table border
  const tableWidth = colWidths.reduce((a, b) => a + b, 0)
  doc.setLineWidth(0.3)
  doc.rect(margin, tableTop, tableWidth, rowHeight * (numRows + 1))

  // Draw column lines
  let xPos = margin
  for (let i = 0; i < colWidths.length; i++) {
    doc.line(xPos, tableTop, xPos, tableTop + rowHeight * (numRows + 1))
    xPos += colWidths[i]
  }

  // Draw row lines
  for (let i = 0; i <= numRows + 1; i++) {
    doc.line(margin, tableTop + i * rowHeight, margin + tableWidth, tableTop + i * rowHeight)
  }

  doc.setFontSize(9)
  doc.setFont("helvetica")
  const headers = ["Date", "Clock In", "Meal Out", "Meal Return", "Clock Out", "Reason"]
  xPos = margin
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], xPos + colWidths[i] / 2, tableTop + 6, { align: "center" })
    xPos += colWidths[i]
  }

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  for (let i = 0; i < numRows; i++) {
    const adj = data.adjustments[i]
    const rowY = tableTop + (i + 1) * rowHeight + 6

    if (adj) {
      xPos = margin
      // Format date properly
      const formattedDate = adj.date ? new Date(adj.date).toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit' 
      }) : ""
      doc.text(formattedDate, xPos + colWidths[0] / 2, rowY, { align: "center" })
      xPos += colWidths[0]
      
      // Format time using formatTime function
      const clockIn = formatTime(adj.clockIn || "")
      doc.text(clockIn, xPos + colWidths[1] / 2, rowY, { align: "center" })
      xPos += colWidths[1]
      
      const mealOut = formatTime(adj.mealOut || "")
      doc.text(mealOut, xPos + colWidths[2] / 2, rowY, { align: "center" })
      xPos += colWidths[2]
      
      const mealReturn = formatTime(adj.mealReturn || "")
      doc.text(mealReturn, xPos + colWidths[3] / 2, rowY, { align: "center" })
      xPos += colWidths[3]
      
      const clockOut = formatTime(adj.clockOut || "")
      doc.text(clockOut, xPos + colWidths[4] / 2, rowY, { align: "center" })
      xPos += colWidths[4]

      // Reason text with better wrapping
      const reasonText = doc.splitTextToSize(adj.reason || "", colWidths[5] - 3)
      doc.text(reasonText, xPos + 2, rowY)
    }
  }

  // Remarks Section
  yPos = tableTop + rowHeight * (numRows + 1) + 15
  doc.setFontSize(11)
  doc.setFont("helvetica")
  doc.text("Remarks", margin, yPos)

  yPos += 5
  const remarksHeight = 35
  doc.setLineWidth(0.3)
  doc.rect(margin, yPos, pageWidth - 2 * margin, remarksHeight)

  // Fill in remarks
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  if (data.remarks) {
    const remarksLines = doc.splitTextToSize(data.remarks, pageWidth - 2 * margin - 6)
    doc.text(remarksLines, margin + 3, yPos + 6)
  }

  // Employee Signature Section
  yPos += remarksHeight + 15
  doc.setFontSize(11)
  doc.setFont("helvetica")
  doc.text("Employee Signature", margin, yPos)

  yPos += 10
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  doc.text("Name:", margin, yPos)
  doc.setFont("helvetica")
  doc.text(data.employeeName || "", margin + 18, yPos)

  yPos += 12
  doc.setFont("helvetica", "normal")
  doc.text("Signature:", margin, yPos)
  // Longer signature line
  doc.setLineWidth(0.3)
  doc.line(margin + 25, yPos + 1, pageWidth - margin - 50, yPos + 1)

  doc.text("Date:", pageWidth - margin - 45, yPos)
  doc.line(pageWidth - margin - 35, yPos + 1, pageWidth - margin, yPos + 1)

  // Footer
  yPos += 10
  doc.setFontSize(9)
  doc.setFont("helvetica", "italic")
  doc.setTextColor(60, 60, 60)
  doc.text("*Contact HR if you have any questions.", margin, yPos)

  return doc
}

export async function generateTimesheetPDF(data: TimesheetData): Promise<jsPDF> {
  const doc = new jsPDF()

  const templateImg = "/templates/timesheet-template.png"

  try {
    // Add template image as background
    const img = await loadImage(templateImg)
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Add image to fill the page
    doc.addImage(img, "PNG", 0, 0, pageWidth, pageHeight)

    doc.setTextColor(0, 0, 0)

    // Employee Information Section
    doc.setFontSize(10)
    doc.setFont("helvetica")

    // Name field (left side, first row) - adjusted position
    doc.text(data.employeeName || "", 61, 64)

    // Employee # field (right side, first row) - adjusted position
    doc.text(data.employeeNumber || "", 145, 64)

    // Dept. field (left side, second row) - adjusted position
    doc.text(data.department || "", 61, 71)

    // Supervisor Name field (right side, second row) - adjusted position
    doc.text(data.supervisorName || "", 145, 71)

    // Adjustments Table Section
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    const startY = 94 // First data row Y position - moved down significantly
    const rowHeight = 6 // Height between rows - increased

    for (let i = 0; i < Math.min(data.adjustments.length, 7); i++) {
      const adj = data.adjustments[i]
      const rowY = startY + i * rowHeight

      if (adj) {
        // Date column - moved to proper position
        const formattedDate = adj.date ? new Date(adj.date).toLocaleDateString('en-US', { 
          month: '2-digit', 
          day: '2-digit' 
        }) : ""
        doc.text(formattedDate, 30, rowY, { align: "center" })

        // Clock In column - moved to proper position
        const clockIn = adj.clockIn ? formatTime(adj.clockIn) : ""
        doc.text(clockIn, 51, rowY, { align: "center" })

        // Meal Out column - moved to proper position
        const mealOut = adj.mealOut ? formatTime(adj.mealOut) : ""
        doc.text(mealOut, 74, rowY, { align: "center" })

        // Meal Return column - moved to proper position
        const mealReturn = adj.mealReturn ? formatTime(adj.mealReturn) : ""
        doc.text(mealReturn, 98, rowY, { align: "center" })

        // Clock Out column - moved to proper position
        const clockOut = adj.clockOut ? formatTime(adj.clockOut) : ""
        doc.text(clockOut, 120, rowY, { align: "center" })

        // Reason column - moved to proper position and wrapping
        const reasonText = doc.splitTextToSize(adj.reason || "", 50)
        doc.text(reasonText, 135, rowY )
      }
    }

    // Remarks section - adjusted position
    if (data.remarks) {
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      const remarksLines = doc.splitTextToSize(data.remarks, 170)
      doc.text(remarksLines, 28, 155)
    }

    // Employee Name
    doc.setFontSize(10)
    doc.setFont("helvetica")
    // Name field
    doc.text(data.employeeName || "", 55, 244)

    // Employee Signature section - adjusted positions
    doc.setFontSize(10)
    doc.setFont("helvetica")
    // Name field
    doc.text(data.employeeName || "", 55, 254)

    // Date field (current date) - adjusted position
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const currentDate = new Date().toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    })
    // employee signature date
    doc.text(currentDate, 150, 254)
  } catch (error) {
    console.error("Error loading template image:", error)
    // Fallback to programmatic generation if template fails
    return generateFallbackPDF(data)
  }

  return doc
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename)
}
