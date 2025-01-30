"use client"
import { useEffect, useState } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import UrlList from './components/UrlList'
import Image from 'next/image'

interface Url {
  id: string
  name?: string
  url: string
  status: 'up' | 'down' | 'pending'
  uptime: number
  last_check_latency?: number
}

interface Settings {
  title?: string
  logo_url?: string
  description?: string
  alert_threshold?: number
}

export default function HomePage() {
  const [urls, setUrls] = useState<Url[]>([])
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchUrls(),
      fetchSettings()
    ]).finally(() => setLoading(false))
  }, [])

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch URLs')
      }
      const data = await response.json()
      setUrls(data || [])
    } catch (error) {
      console.error('Error fetching URLs:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch settings')
      }
      const data = await response.json()
      setSettings(data || {})
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  // Calculate stats
  const totalUrls = urls?.length || 0
  const upUrls = urls?.filter(url => url?.status === "up")?.length || 0
  const averageUptime = totalUrls ? 
    urls.reduce((acc, url) => acc + (url?.uptime || 0), 0) / totalUrls : 
    0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Logo and Title */}
        <div className="text-center mb-8">
          {settings.logo_url && (
            <div className="mb-4">
              <Image 
                src={settings.logo_url}
                alt={settings.title || 'Site Logo'}
                width={120}
                height={120}
                className="mx-auto"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900">
            {settings.title || 'URL Monitor'}
          </h1>
          {settings.description && (
            <p className="mt-2 text-lg text-gray-600">
              {settings.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowUpIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total URLs
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {totalUrls}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowUpIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      URLs Up
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {upUrls} / {totalUrls}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowDownIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Average Uptime
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {averageUptime.toFixed(2)}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* URL List */}
        {urls.length > 0 ? (
          <UrlList urls={urls} isAdmin={false} />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No URLs added</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add URLs in the admin dashboard to start monitoring.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

