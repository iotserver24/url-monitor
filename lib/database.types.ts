export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      urls: {
        Row: {
          id: string
          name: string
          url: string
          status: 'up' | 'down' | 'pending'
          uptime: number
          response_time: number
          last_checked: string
          down_since: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          name?: string
          url: string
          status?: 'up' | 'down' | 'pending'
          uptime?: number
          response_time?: number
          last_checked?: string
          down_since?: string | null
          is_active?: boolean
        }
        Update: Partial<Tables['urls']['Row']>
      }
      settings: {
        Row: {
          id: string
          title: string
          description: string
          logo_url: string
          company_name: string
          contact_email: string
          alert_email: string
          alert_threshold: number
          show_watermark: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['settings']['Row']>
      }
      logs: {
        Row: {
          id: string
          url_id: string
          url_name: string
          status: 'up' | 'down'
          response_time: number
          status_code: number
          uptime: number
          timestamp: string
          details: string
        }
        Insert: Omit<Tables['logs']['Row'], 'id' | 'timestamp'>
        Update: Partial<Tables['logs']['Row']>
      }
    }
  }
} 