import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch settings
export async function GET(request: NextRequest) {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 'settings' }
    })

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 'settings',
          logoUrl: '',
          userImage: ''
        }
      })
    }

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

    const updated = await prisma.settings.upsert({
      where: { id: 'settings' },
      update: body,
      create: {
        id: 'settings',
        ...body
      }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


