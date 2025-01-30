'use client'
import { useEffect, useState } from 'react'
import { formatISTDateTime } from '../../../lib/utils/time'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../../../lib/database.types'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

type Log = Database['public']['Tables']['logs']['Row']

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [urls, setUrls] = useState<{ id: string, name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // Filter states
  const [selectedUrl, setSelectedUrl] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'up' | 'down'>('all')
  const [dateRange, setDateRange] = useState({
    start: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/login')
      return
    }

    fetchUrls()
    fetchLogs()
  }, [selectedUrl, selectedStatus, dateRange])

  async function fetchUrls() {
    const { data: urlsData } = await supabase
      .from('urls')
      .select('id, name')
    
    if (urlsData) setUrls(urlsData)
  }

  async function fetchLogs() {
    setLoading(true)
    let query = supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false })
    
    // Apply URL filter
    if (selectedUrl !== 'all') {
      query = query.eq('url_id', selectedUrl)
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      query = query.eq('status', selectedStatus)
    }
    
    // Apply date range filter
    query = query
      .gte('timestamp', dateRange.start + 'T00:00:00')
      .lte('timestamp', dateRange.end + 'T23:59:59')

    const { data } = await query
    
    if (data) setLogs(data)
    setLoading(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Monitoring Logs</h1>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* URL Filter */}
        <select
          value={selectedUrl}
          onChange={(e) => setSelectedUrl(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All URLs</option>
          {urls.map((url) => (
            <option key={url.id} value={url.id}>
              {url.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'up' | 'down')}
          className="border rounded p-2"
        >
          <option value="all">All Statuses</option>
          <option value="up">Up</option>
          <option value="down">Down</option>
        </select>

        {/* Date Range Filters */}
        {/* <div className="flex items-center">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="border rounded p-2"
          />
        </div>
        <div className="flex items-center">
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="border rounded p-2"
          />
        </div> */}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp (IST)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Response Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map(log => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatISTDateTime(log.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{log.url_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    log.status === 'up' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {log.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.response_time}ms
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 