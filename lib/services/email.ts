import { createTransport } from 'nodemailer'
import type { Settings } from '../models/Settings'

const transporter = createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_KEY,
  },
})

export async function sendAlertEmail(
  url: string, 
  uptime: number, 
  settings: Settings
) {
  const timestamp = new Date().toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'long'
  })

  const html = `
    <h2>🚨 Website Down Alert</h2>
    <div style="padding: 20px; border: 1px solid #ff4444; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #ff4444; margin: 0;">Website is Currently DOWN</h3>
      <p><strong>URL:</strong> ${url}</p>
      <p><strong>Detected At:</strong> ${timestamp}</p>
      <p><strong>Current Uptime:</strong> ${uptime.toFixed(2)}%</p>
      <p><strong>Alert Threshold:</strong> ${settings.alert_threshold}%</p>
    </div>
    <p>Please check your website and take necessary action.</p>
    <p>
      <a href="${settings.company_name ? `https://${settings.company_name}` : '#'}/admin/urls" 
         style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        View Dashboard
      </a>
    </p>
    <hr>
    <p><small>Sent by URL Monitor | ${settings.company_name || 'MegaVault'}</small></p>
  `

  return transporter.sendMail({
    from: `"URL Monitor" <${settings.alert_email}>`,
    to: settings.contact_email,
    subject: `🚨 ALERT: ${url} is DOWN`,
    html,
  })
} 