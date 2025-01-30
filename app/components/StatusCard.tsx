"use client"

import { useState, useEffect } from "react"
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid"
import { formatDistanceToNow, parseISO } from "date-fns"
import { formatISTDateTime } from '../../lib/utils/time'

export default function StatusCard({ url, isAdmin = false }: { url: any, isAdmin?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [logs, setLogs] = useState([])
  const [currentUrl, setCurrentUrl] = useState(url)

  // Fetch latest URL data every 2 minutes
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const response = await fetch(`/api/urls/${url.id}`)
        if (response.ok) {
          const data = await response.json()
          setCurrentUrl(data)
        }
      } catch (error) {
        console.error('Error fetching latest URL data:', error)
      }
    }

    // Initial fetch
    fetchLatestData()

    // Set up interval
    const interval = setInterval(fetchLatestData, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [url.id])

  // Fetch logs when expanded and every 2 minutes
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/urls/${currentUrl.id}/logs`)
        if (response.ok) {
          const data = await response.json()
          setLogs(data)
        }
      } catch (error) {
        console.error('Error fetching logs:', error)
      }
    }

    if (isExpanded) {
      fetchLogs()
      const interval = setInterval(fetchLogs, 120000)
      return () => clearInterval(interval)
    }
  }, [currentUrl.id, isExpanded])

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
    } catch {
      return "N/A"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div 
        className="p-4 sm:p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {currentUrl.status === "up" ? (
              <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
            ) : (
              <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0" />
            )}
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900">{currentUrl.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500 break-all">{currentUrl.url}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{currentUrl.uptime.toFixed(2)}%</p>
            <p className="text-xs sm:text-sm text-gray-500">Uptime</p>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Checked</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatISTDateTime(currentUrl.last_checked)}
                </dd>
              </div>
              <div>
                <dt className="text-xs sm:text-sm font-medium text-gray-500">Response Time</dt>
                <dd className="mt-1 text-xs sm:text-sm text-gray-900">{currentUrl.response_time}ms</dd>
              </div>
            </dl>
          </div>
        )}

        {/* Logs section */}
        <div className="mt-4 pt-4 border-t">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">Recent Checks</h3>
          <div className="mt-2 space-y-2">
            {logs.slice(0, 5).map((log: any) => (
              <div key={log.id} className="flex justify-between text-xs sm:text-sm">
                <span className={log.status === "up" ? "text-green-600" : "text-red-600"}>
                  {log.status.toUpperCase()}
                </span>
                <span className="text-gray-500">
                  {formatISTDateTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 