"use client"

import { useState } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import UptimeChart from './UptimeChart'
import { formatISTDateTime } from '../../lib/utils/time'

interface Url {
  id: string  // Changed from _id to id to match Supabase
  name?: string
  url: string
  status: 'up' | 'down' | 'pending'
  uptime: number
  last_check_latency?: number
  last_checked: string
}

interface UrlListProps {
  urls: Url[]
  onUrlDeleted?: () => void
  isAdmin?: boolean
}

export default function UrlList({ urls, onUrlDeleted, isAdmin = false }: UrlListProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this URL?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: 'DELETE',
        headers: {
          'x-is-admin': 'true'
        }
      })

      if (!response.ok) throw new Error('Failed to delete URL')
      
      toast.success('URL deleted successfully')
      onUrlDeleted?.()
    } catch (error) {
      console.error('Error deleting URL:', error)
      toast.error('Failed to delete URL')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {urls.map((url) => (
        <div key={url.id} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {url.name || url.url}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{url.url}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(url.id)}
                  disabled={loading}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${
                    url.status === 'up' ? 'bg-green-400' : 
                    url.status === 'down' ? 'bg-red-400' : 'bg-gray-400'
                  }`} />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {url.status?.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Uptime: {url.uptime?.toFixed(2)}%
                </div>
                {url.last_check_latency && (
                  <div className="text-sm text-gray-500">
                    Response Time: {url.last_check_latency}ms
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Last checked: {formatISTDateTime(url.last_checked)}
            </div>
          </div>
          <div className="h-48">
            <UptimeChart urlId={url.id} />
          </div>
        </div>
      ))}
    </div>
  )
}

