import { NextResponse } from "next/server"
import { sendEmail, generateEmailHTML } from "../../../../lib/email"
import Settings from "../../../../models/Settings"

export async function POST(request: Request) {
  try {
    const isAdmin = request.headers.get('x-is-admin')
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Validate email configuration
    if (!process.env.BREVO_USER || !process.env.BREVO_KEY) {
      return NextResponse.json({ 
        error: 'Email configuration missing. Please set BREVO_USER and BREVO_KEY environment variables.' 
      }, { status: 500 })
    }

    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ 
        error: 'Email address is required' 
      }, { status: 400 })
    }

    const settings = await Settings.findOne()

    const html = await generateEmailHTML({
      siteName: settings?.title || "Test Site",
      siteUrl: process.env.APP_URL || "https://example.com",
      status: "up",
      uptime: 99.9,
      responseTime: 150,
      threshold: settings?.alert_threshold || 90
    })

    await sendEmail({
      to: email,
      subject: "🔔 URL Monitor - Test Email",
      text: `This is a test email from ${settings?.title || "URL Monitor"}.
If you're receiving this, your email settings are configured correctly.

Time: ${new Date().toLocaleString()}`,
      html
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 