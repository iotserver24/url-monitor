"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from 'react-hot-toast'

interface Settings {
  id?: string
  title: string
  description: string
  logo_url: string
  company_name: string
  contact_email: string
  alert_email: string
  alert_threshold: number
  show_watermark: boolean
}

export default function SettingsForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings>({
    title: '',
    description: '',
    logo_url: '',
    company_name: '',
    contact_email: '',
    alert_email: '',
    alert_threshold: 90,
    show_watermark: true
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'x-is-admin': 'true'
        }
      })
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-is-admin': 'true'
        },
        body: JSON.stringify(settings)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to save settings')

      setSettings(data)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    try {
      const response = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-is-admin': 'true'
        },
        body: JSON.stringify({ email: settings.alert_email })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send test email')
      }

      toast.success('Test email sent successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send test email')
    }
  }

  if (loading) {
    return <div>Loading settings...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Site Title
          </label>
          <input
            type="text"
            id="title"
            value={settings.title}
            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">
            Logo URL
          </label>
          <input
            type="url"
            id="logo_url"
            value={settings.logo_url}
            onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <input
            type="text"
            id="company_name"
            value={settings.company_name}
            onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
            Contact Email
          </label>
          <input
            type="email"
            id="contact_email"
            value={settings.contact_email}
            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Alert Settings</h3>
          
          <div>
            <label htmlFor="alert_email" className="block text-sm font-medium text-gray-700">
              Alert Email
              <span className="ml-1 text-xs text-gray-500">
                (Where to send downtime alerts)
              </span>
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="email"
                id="alert_email"
                value={settings.alert_email}
                onChange={(e) => setSettings({ ...settings, alert_email: e.target.value })}
                className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={handleTestEmail}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Send Test
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="alert_threshold" className="block text-sm font-medium text-gray-700">
              Alert Threshold (ms)
            </label>
            <input
              type="number"
              id="alert_threshold"
              value={settings.alert_threshold}
              onChange={(e) => setSettings({ ...settings, alert_threshold: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
} 