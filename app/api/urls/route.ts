import { NextResponse } from "next/server"
import { supabase } from '../../../lib/db'
import { getISTDateTime } from '../../../lib/utils/time'

type UrlStatus = 'up' | 'down'

// Public GET - no auth required
export async function GET(request: Request) {
  try {
    const isAdmin = request.headers.get('x-is-admin')
    
    // For both public and admin pages, get all URLs
    const { data: urls, error } = await supabase
      .from('urls')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(urls || [])
  } catch (error) {
    console.error('Error fetching URLs:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch URLs',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Admin POST - requires auth
export async function POST(request: Request) {
  try {
    const isAdmin = request.headers.get('x-is-admin')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    if (!data.url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const currentTime = getISTDateTime()

    const { data: url, error } = await supabase
      .from('urls')
      .insert([{
        url: data.url,
        name: data.name || null,
        status: 'down',
        uptime: 100,
        response_time: 0,
        last_checked: currentTime,
        is_active: true,
        created_at: currentTime,
        updated_at: currentTime
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(url)
  } catch (error) {
    console.error('Error adding URL:', error)
    return NextResponse.json({ 
      error: 'Failed to add URL',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const isAdmin = request.headers.get('x-is-admin')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    const { error } = await supabase
      .from('urls')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting URL:', error)
    return NextResponse.json({ error: 'Failed to delete URL' }, { status: 500 })
  }
}

