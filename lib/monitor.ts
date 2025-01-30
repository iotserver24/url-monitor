import { supabase } from './db'
import { sendEmail, generateEmailHTML } from "./email"
import Settings from "../models/Settings"
import type { Url } from '../models/Url'
import { sendAlertEmail } from './services/email'

const UPTIME_WEIGHT = 0.01 // 1% per check
const RECHECK_INTERVAL = 2 * 60 * 1000 // 2 minutes in milliseconds
const ALERT_THRESHOLD = 90 // Send alert when uptime drops below 90%

async function checkUrl(url: string): Promise<{ isUp: boolean; responseTime: number }> {
  const start = Date.now()
  try {
    const response = await fetch(url, { 
      timeout: 30000, // 30 second timeout
      headers: { 'User-Agent': 'URL-Monitor/1.0' }
    })
    const responseTime = Date.now() - start
    return { isUp: response.ok, responseTime }
  } catch (error) {
    return { isUp: false, responseTime: Date.now() - start }
  }
}

async function updateUrlStatus(url: Url, isUp: boolean, responseTime: number) {
  // Calculate new uptime
  const newUptime = url.uptime * (1 - UPTIME_WEIGHT) + (isUp ? 1 : 0) * UPTIME_WEIGHT

  // Get settings for threshold check
  const settings = await Settings.findOne()
  
  // Check if we need to send an alert
  if (newUptime < settings.alert_threshold && url.uptime >= settings.alert_threshold) {
    try {
      await sendAlertEmail(url.url, newUptime, settings)
      console.log(`Alert sent for ${url.url} - Uptime: ${newUptime}%`)
    } catch (error) {
      console.error('Failed to send alert email:', error)
    }
  }

  // Update URL status
  const { error: updateError } = await supabase
    .from('urls')
    .update({
      status: isUp ? 'up' : 'down',
      response_time: responseTime,
      uptime: newUptime,
      last_checked: new Date().toISOString(),
      down_since: isUp ? null : (url.down_since || new Date().toISOString())
    })
    .eq('id', url.id)

  if (updateError) throw updateError

  // Log the check
  const { error: logError } = await supabase
    .from('logs')
    .insert([{
      url_id: url.id,
      url_name: url.name || url.url,
      status: isUp ? 'up' : 'down',
      response_time: responseTime,
      uptime: newUptime,
      details: isUp ? 'Site is up' : 'Site is down'
    }])

  if (logError) throw logError

  return newUptime
}

async function sendAlertEmail(url: any, settings: any) {
  try {
    const html = await generateEmailHTML({
      siteName: settings.title || "URL Monitor",
      siteUrl: url.url,
      status: "down",
      uptime: url.uptime,
      responseTime: url.last_check_latency || 0,
      threshold: settings.alert_threshold || ALERT_THRESHOLD
    })

    await sendEmail({
      to: settings.alert_email,
      subject: `🚨 ${url.name || url.url} is DOWN`,
      text: `Your website ${url.name || url.url} is currently down.
Current uptime: ${url.uptime.toFixed(2)}%
Last checked: ${new Date().toLocaleString()}
Response time: ${url.last_check_latency || 0}ms`,
      html
    })

    // Log that alert was sent
    await supabase
      .from('alerts')
      .insert([{
        url_id: url.id,
        type: 'email',
        status: 'sent',
        details: `Downtime alert sent to ${settings.alert_email}`
      }])

  } catch (error) {
    console.error('Error sending alert email:', error)
    // Log failed alert attempt
    await supabase
      .from('alerts')
      .insert([{
        url_id: url.id,
        type: 'email',
        status: 'failed',
        details: error instanceof Error ? error.message : String(error)
      }])
  }
}

export async function monitorUrls() {
  try {
    // Get settings first
    const settings = await Settings.findOne()
    if (!settings?.alert_email) {
      console.warn('No alert email configured, skipping monitoring')
      return
    }

    // Get all URLs to monitor
    const { data: urls, error } = await supabase
      .from('urls')
      .select('*')
      .eq('is_active', true)

    if (error) throw error
    if (!urls?.length) return

    for (const url of urls) {
      const { isUp, responseTime } = await checkUrl(url.url)
      const newUptime = await updateUrlStatus(url, isUp, responseTime)

      // Send alert if uptime drops below threshold
      if (newUptime < (settings.alert_threshold || ALERT_THRESHOLD)) {
        await sendAlertEmail(url, settings)
      }
    }
  } catch (error) {
    console.error('Error in URL monitoring:', error)
  }
}

// Start monitoring
export function startMonitoring() {
  // Initial check
  monitorUrls()

  // Schedule regular checks
  setInterval(monitorUrls, RECHECK_INTERVAL)
}

export { checkUrl, updateUrlStatus } 