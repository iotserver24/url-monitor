"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SettingsForm from "../../components/SettingsForm"

type Settings = {
  title: string
  description: string
  logoUrl: string
  companyName: string
  contactEmail: string
  alertEmail: string
  alertThreshold: number
  showWatermark: boolean
}

const defaultSettings: Settings = {
  title: "URL Monitor",
  description: "Monitor your website uptime and performance",
  logoUrl: "/default-logo.png",
  companyName: "MegaVault",
  contactEmail: "support@megavault.in",
  alertEmail: "alerts@yourdomain.com",
  alertThreshold: 90,
  showWatermark: true
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/login')
      return
    }

    // Fetch settings
    fetch('/api/settings', {
      headers: {
        'x-is-admin': 'true'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings(data)
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching settings:', error)
        setLoading(false)
      })
  }, [router])

  if (loading) return <div>Loading...</div>

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Settings</h1>
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  )
} 