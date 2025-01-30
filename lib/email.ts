import nodemailer from 'nodemailer'

// Create reusable transporter object using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER || '',    // Changed from BREVO_SMTP_USER
    pass: process.env.BREVO_KEY || '',     // Changed from BREVO_SMTP_KEY
  },
})

export async function generateEmailHTML({
  siteName,
  siteUrl,
  status,
  uptime,
  responseTime,
  threshold
}: {
  siteName: string
  siteUrl: string
  status: string
  uptime: number
  responseTime: number
  threshold: number
}) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>🔔 URL Monitor Alert</h1>
      <p><strong>${siteName}</strong> (${siteUrl})</p>
      <div style="margin: 20px 0; padding: 20px; background: ${status === 'up' ? '#e6ffe6' : '#ffe6e6'}; border-radius: 5px;">
        <p><strong>Status:</strong> ${status.toUpperCase()}</p>
        <p><strong>Uptime:</strong> ${uptime.toFixed(2)}%</p>
        <p><strong>Response Time:</strong> ${responseTime}ms</p>
        <p><strong>Alert Threshold:</strong> ${threshold}%</p>
      </div>
      <p style="color: #666; font-size: 12px;">Time: ${new Date().toLocaleString()}</p>
    </div>
  `
}

export async function sendEmail({ 
  to, 
  subject, 
  text, 
  html 
}: { 
  to: string
  subject: string
  text: string
  html?: string
}) {
  if (!process.env.BREVO_USER || !process.env.BREVO_KEY) {
    throw new Error('Email configuration missing. Please set BREVO_USER and BREVO_KEY environment variables.')
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.ALERT_FROM_EMAIL || 'alerts@megavault.in',
      to,
      subject,
      text,
      html: html || text,
    })
    console.log('Email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
} 