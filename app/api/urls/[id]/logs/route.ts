import { NextResponse } from "next/server"
import { supabase } from '../../../../../lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = request.headers.get('x-is-admin')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the URL segments and extract the ID
    const segments = request.url.split('/')
    const urlId = segments[segments.length - 2] // Get the ID from the URL path

    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .eq('url_id', urlId)
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })

    if (error) throw error
    return NextResponse.json(logs || [])
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
} 