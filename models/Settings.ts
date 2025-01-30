import { supabase } from '../lib/db'

export interface Settings {
  id?: string
  title: string
  description: string
  logo_url: string
  company_name: string
  contact_email: string
  alert_email: string
  alert_threshold: number
  show_watermark: boolean
  created_at?: string
  updated_at?: string
}

// Helper function to get settings from the database
export async function findOne() {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings exist, return default settings
        return {
          title: "URL Monitor",
          description: "Monitor your website uptime and performance",
          logo_url: "/default-logo.png",
          company_name: "MegaVault",
          contact_email: "support@megavault.in",
          alert_email: "alerts@megavault.in",
          alert_threshold: 90,
          show_watermark: true
        }
      }
      throw error
    }

    return settings
  } catch (error) {
    console.error('Error fetching settings:', error)
    throw error
  }
}

export default { findOne } 