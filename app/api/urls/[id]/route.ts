import { NextResponse } from "next/server"
import { supabase } from '../../../../lib/db'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = request.headers.get('x-is-admin')
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { error } = await supabase
      .from('urls')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting URL:', error)
    return NextResponse.json({ error: 'Failed to delete URL' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: url, error } = await supabase
      .from('urls')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching URL:', error)
      throw error
    }

    if (!url) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 })
    }

    return NextResponse.json(url)
  } catch (error) {
    console.error('Error fetching URL:', error)
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 })
  }
}

