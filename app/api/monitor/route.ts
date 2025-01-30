import { NextResponse } from "next/server";
import { supabase } from '../../../lib/db'
import { checkUrl, updateUrlStatus } from '../../../lib/monitor'
import type { Url } from '../../../models/Url'

// Handle POST requests from worker
export async function POST(request: Request) {
  try {
    console.log('Monitor API called at:', new Date().toISOString());
    
    // Verify request is from Cloudflare Worker
    const isWorker = request.headers.get('CF-Worker');
    if (!isWorker) {
      console.log('Unauthorized request - missing CF-Worker header');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const results = await monitorUrls();
    
    // Ensure all data is serializable
    const serializedResults = {
      timestamp: new Date().toISOString(),
      urlsChecked: results.urlsChecked,
      results: results.results.map(result => ({
        ...result,
        urlId: result.urlId.toString(),
        logId: result.logId.toString(),
        timestamp: new Date(result.timestamp).toISOString()
      }))
    };

    return NextResponse.json(serializedResults);
  } catch (error) {
    console.error('Error in monitor endpoint:', error);
    return NextResponse.json({
      error: 'Monitor check failed',
      details: error.message
    }, { status: 500 });
  }
}

// Handle GET requests for testing
export async function GET() {
  try {
    // Get all active URLs
    const { data: urls, error } = await supabase
      .from('urls')
      .select('*')
      .eq('is_active', true)

    if (error) throw error

    // Check each URL
    for (const url of urls) {
      try {
        const { isUp, responseTime } = await checkUrl(url.url)
        await updateUrlStatus(url as Url, isUp, responseTime)
      } catch (error) {
        console.error(`Error checking ${url.url}:`, error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Monitor error:', error)
    return NextResponse.json({ error: 'Monitor failed' }, { status: 500 })
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Worker',
      'Access-Control-Max-Age': '86400',
    },
  });
} 