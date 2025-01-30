import { NextResponse } from "next/server"
import { sendAlertEmail } from '../../../lib/services/email'
import Settings from '../../../models/Settings'

export async function POST(request: Request) {
  try {
    const { url, uptime } = await request.json()
    
    // Verify request is from our worker
    const isWorker = request.headers.get('CF-Worker')
    if (!isWorker) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const settings = await Settings.findOne()
    
    await sendAlertEmail(url, uptime, settings)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending alert:', error)
    return NextResponse.json(
      { error: 'Failed to send alert' },
      { status: 500 }
    )
  }
} 