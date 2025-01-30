import { NextResponse } from "next/server"
import { supabase } from '../../../lib/db'

const defaultSettings = {
  title: "URL Monitor",
  description: "Monitor your website uptime and performance",
  logo_url: "/default-logo.png",
  company_name: "MegaVault",
  contact_email: "support@megavault.in",
  alert_email: "alerts@megavault.in",
  alert_threshold: 90,
  show_watermark: true
}

export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings exist, create default
        const { data: newSettings, error: createError } = await supabase
          .from('settings')
          .insert([defaultSettings])
          .select()
          .single()

        if (createError) throw createError
        return NextResponse.json(newSettings)
      }
      throw error
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    // Return default settings on error
    return NextResponse.json(defaultSettings)
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = request.headers.get('x-is-admin')
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['title', 'company_name', 'contact_email', 'alert_email']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Update settings
    const { data: settings, error } = await supabase
      .from('settings')
      .upsert({
        ...defaultSettings, // Ensure all fields exist
        ...data, // Override with provided values
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
} 