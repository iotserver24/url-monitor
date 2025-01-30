import { supabase } from '../lib/db'

export interface Url {
  id: string
  name?: string
  url: string
  status: 'up' | 'down' | 'pending'
  uptime: number
  response_time: number
  last_checked: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export async function findAll() {
  const { data, error } = await supabase
    .from('urls')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function findOne(id: string) {
  const { data, error } = await supabase
    .from('urls')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateStatus(id: string, status: 'up' | 'down', responseTime: number, uptime: number) {
  const { error } = await supabase
    .from('urls')
    .update({
      status,
      response_time: responseTime,
      uptime,
      last_checked: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw error
}

export default { findAll, findOne, updateStatus } 