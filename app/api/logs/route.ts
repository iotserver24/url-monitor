import { NextResponse } from "next/server"
import { supabase } from '../../../lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '1')
    const urlId = searchParams.get('urlId')

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Build query
    let query = supabase
      .from('logs')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })

    // Add URL filter if provided
    if (urlId) {
      query = query.eq('url_id', urlId)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(logs || [])
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
} 