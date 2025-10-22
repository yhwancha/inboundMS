import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/data-storage'

// GET: Fetch all locations
export async function GET(request: NextRequest) {
  try {
    const locations = storage.getLocations()
    return NextResponse.json(locations)
  } catch (error: any) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Initialize locations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locations } = body

    if (!locations || !Array.isArray(locations)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    storage.initializeLocations(locations)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error initializing locations:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update location status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 })
    }

    const updated = storage.updateLocation(id, status)
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating location:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


