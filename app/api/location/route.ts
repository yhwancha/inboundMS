import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch all locations
export async function GET(request: NextRequest) {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { id: 'asc' }
    })
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

    // Upsert locations
    const operations = locations.map((loc: { id: string; status: string }) =>
      prisma.location.upsert({
        where: { id: loc.id },
        update: { status: loc.status },
        create: { id: loc.id, status: loc.status }
      })
    )

    await prisma.$transaction(operations)

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

    const updated = await prisma.location.upsert({
      where: { id },
      update: { status },
      create: { id, status }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating location:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


