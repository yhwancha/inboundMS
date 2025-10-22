import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch all schedules or by date
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    if (date) {
      const schedules = await prisma.schedule.findMany({
        where: { date },
        orderBy: { appointmentTime: 'asc' }
      })
      return NextResponse.json(schedules)
    }

    const schedules = await prisma.schedule.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(schedules)
  } catch (error: any) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create new schedule(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { schedules } = body

    if (!schedules || !Array.isArray(schedules)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    // Delete existing schedules for the date
    if (schedules.length > 0) {
      await prisma.schedule.deleteMany({
        where: { date: schedules[0].date }
      })
    }

    // Create new schedules
    const created = await prisma.schedule.createMany({
      data: schedules
    })

    return NextResponse.json({ success: true, count: created.count })
  } catch (error: any) {
    console.error('Error creating schedules:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update schedule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const updated = await prisma.schedule.update({
      where: { id },
      data
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating schedule:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Delete schedule
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.schedule.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


