import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/data-storage'

// GET: Fetch all schedules or by date
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    const schedules = storage.getSchedules(date || undefined)
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

    const count = storage.createSchedules(schedules)
    return NextResponse.json({ success: true, count })
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

    const updated = storage.updateSchedule(id, data)
    
    if (!updated) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

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

    const success = storage.deleteSchedule(id)
    
    if (!success) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


