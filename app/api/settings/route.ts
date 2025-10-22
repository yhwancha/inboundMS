import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/data-storage'

// GET: Fetch settings
export async function GET(request: NextRequest) {
  try {
    const settings = storage.getSettings()
    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const updated = storage.updateSettings(body)
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


