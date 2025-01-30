import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'

interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  APP_URL: string
}

async function checkUrl(url: string): Promise<{ ok: boolean; status: number; time: number }> {
  const start = Date.now()
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'URL-Monitor/1.0' },
      redirect: 'follow'
    })
    return {
      ok: response.ok,
      status: response.status,
      time: Date.now() - start
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      time: Date.now() - start
    }
  }
}

async function sendAlert(url: string, uptime: number, status: string, env: Env) {
  try {
    // Only send alert if status is down AND uptime is below threshold
    if (status === 'down') {
      await fetch(`${env.APP_URL}/api/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CF-Worker': 'true'
        },
        body: JSON.stringify({ 
          url,
          uptime,
          status,
          timestamp: new Date().toISOString()
        })
      })
      console.log(`Alert sent for ${url} - Status: DOWN, Uptime: ${uptime.toFixed(2)}%`)
    }
  } catch (error) {
    console.error('Failed to send alert:', error)
  }
}

export default {
  // Runs every 2 minutes
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const supabase = createClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY
    )
    
    try {
      // First get settings to check threshold
      const { data } = await supabase
        .from('settings')
        .select('alert_threshold')
        .single()

      // Use a let for the settings variable since we might need to modify it
      let settings = data || { alert_threshold: 90 }

      // Get all active URLs
      const { data: urls } = await supabase
        .from('urls')
        .select('*')
        .eq('is_active', true)

      if (!urls) return

      // Check each URL
      for (const url of urls) {
        try {
          const check = await checkUrl(url.url)
          const status = check.ok ? 'up' : 'down'
          
          // Fix the uptime calculation
          const newUptime = status === 'up' 
            ? Math.min(100, url.uptime + (100 - url.uptime) * 0.01) // Increase if up
            : Math.max(0, url.uptime * 0.99) // Decrease only if down

          // Update URL status
          await supabase
            .from('urls')
            .update({
              status,
              response_time: check.time,
              uptime: newUptime,
              last_checked: new Date().toISOString(),
              down_since: status === 'down' && url.status === 'up'
                ? new Date().toISOString()
                : status === 'up' ? null : url.down_since
            })
            .eq('id', url.id)

          // Send alert if URL is down AND uptime is below threshold
          if (status === 'down' && newUptime < settings.alert_threshold) {
            await sendAlert(url.url, newUptime, status, env)
          }

          // Log the check
          await supabase.from('logs').insert({
            url_id: url.id,
            url_name: url.name,
            status,
            response_time: check.time,
            status_code: check.status,
            uptime: newUptime,
            details: status === 'up' 
              ? `Response OK (${check.status})`
              : `HTTP Error: ${check.status}`
          })

          console.log(`✓ ${url.name || url.url}: ${status.toUpperCase()}, ${check.time}ms, Uptime: ${newUptime.toFixed(2)}%`)
        } catch (error) {
          console.error(`✗ Error checking ${url.name || url.url}:`, error)
        }
      }
    } catch (error) {
      console.error('Worker error:', error)
    }
  }
} 