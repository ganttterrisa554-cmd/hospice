import { NextResponse } from 'next/server'

// In-memory store for server runtime
let applications = []

export async function GET() {
  return NextResponse.json({
    success: true,
    count: applications.length,
    applications
  })
}

export async function POST(request) {
  try {
    const data = await request.json()
    const record = {
      ...data,
      id: data.id || `APP-${Math.floor(100000 + Math.random() * 900000)}`,
      receivedAt: new Date().toISOString()
    }
    applications.unshift(record)
    return NextResponse.json({ success: true, application: record })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid application payload' },
      { status: 400 }
    )
  }
}
