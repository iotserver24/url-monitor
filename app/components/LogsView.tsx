"use client"

import { useEffect, useState } from "react"

export default function LogsView({ urlId }: { urlId?: string }) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      const params = new URLSearchParams()
      if (urlId) params.append('urlId', urlId)
      params.append('days', '7')

      const response = await fetch(`/api/logs?${params}`)
      const data = await response.json()
      setLogs(data)
      setLoading(false)
    }

    fetchLogs()
  }, [urlId])

  if (loading) return <div>Loading logs...</div>

  return (
    <div className="space-y-4">
      {logs.map(log => (
        <div key={log._id} className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">{log.urlName}</p>
            <p className="text-xs text-gray-500">
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${
              log.status === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {log.status.toUpperCase()}
            </p>
            <p className="text-xs text-gray-500">{log.responseTime}ms</p>
          </div>
        </div>
      ))}
    </div>
  )
} 