import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/data-storage'

// GET: Fetch all timesheet entries
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    const entries = storage.getTimesheets(date || undefined)
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
    const entry = storage.createTimesheet(body)
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

    const updated = storage.updateTimesheet(id, data)
    
    if (!updated) {
      return NextResponse.json({ error: 'Timesheet entry not found' }, { status: 404 })
    }

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

    const success = storage.deleteTimesheet(id)
    
    if (!success) {
      return NextResponse.json({ error: 'Timesheet entry not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting timesheet entry:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


