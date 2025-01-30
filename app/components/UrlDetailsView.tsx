"use client"

import { useState, useEffect } from 'react'
import UptimeChart from './UptimeChart'
import { formatISTDateTime } from '../../lib/utils/time'

export default function UrlDetailsView({ urlId }: { urlId: string }) {
  const [logs, setLogs] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState('24h')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30
      const response = await fetch(`/api/logs?urlId=${urlId}&days=${days}`)
      const data = await response.json()
      setLogs(data)
      setLoading(false)
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [urlId, timeRange])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Uptime Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Uptime History</h3>
        <UptimeChart logs={logs} selectedUrls={[urlId]} height={400} />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500">Current Uptime</h4>
          <p className="mt-2 text-3xl font-semibold">
            {logs[0]?.uptime.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500">Avg Response Time</h4>
          <p className="mt-2 text-3xl font-semibold">
            {(logs.reduce((acc, log) => acc + log.responseTime, 0) / logs.length).toFixed(0)}ms
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500">Status</h4>
          <p className={`mt-2 text-3xl font-semibold ${
            logs[0]?.status === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {logs[0]?.status.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Recent Checks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uptime</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map(log => (
                <tr key={log._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatISTDateTime(log.timestamp)}
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
                    {log.responseTime}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.uptime.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 