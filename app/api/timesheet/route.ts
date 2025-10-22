import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch all timesheet entries
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    if (date) {
      const entries = await prisma.timesheetEntry.findMany({
        where: { date },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(entries)
    }

    const entries = await prisma.timesheetEntry.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(entries)
  } catch (error: any) {
    console.error('Error fetching timesheet entries:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create timesheet entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const entry = await prisma.timesheetEntry.create({
      data: body
    })

    return NextResponse.json(entry)
  } catch (error: any) {
    console.error('Error creating timesheet entry:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update timesheet entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const updated = await prisma.timesheetEntry.update({
      where: { id },
      data
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating timesheet entry:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Delete timesheet entry
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.timesheetEntry.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting timesheet entry:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


