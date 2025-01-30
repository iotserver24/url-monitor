"use client"

import { useState, useEffect } from "react"
import Image from 'next/image'
import Link from 'next/link'
import type { Database } from '../../lib/database.types'

type Settings = Database['public']['Tables']['settings']['Row']

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    id: '',
    title: "URL Monitor",
    description: "Monitor your website uptime and performance",
    logo_url: "/default-logo.png",
    company_name: "MegaVault",
    contact_email: "support@megavault.in",
    alert_email: "alerts@megavault.in",
    alert_threshold: 90,
    show_watermark: true,
    created_at: '',
    updated_at: ''
  })

  useEffect(() => {
    // Check admin status
    setIsAdmin(!!localStorage.getItem('isAdmin'))

    // Fetch settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings(data)
          setImageError(false) // Reset error state when new URL is set
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="mb-6 sm:mb-12">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {settings.logo_url && !imageError ? (
                <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                  <Image 
                    src={settings.logo_url}
                    alt={settings.company_name}
                    fill
                    className="rounded-lg object-cover"
                    onError={() => setImageError(true)}
                    sizes="(max-width: 640px) 48px, 64px"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-xl sm:text-2xl text-gray-400">
                    {settings.company_name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{settings.title}</h1>
                <p className="mt-1 text-sm sm:text-lg text-gray-600">{settings.description}</p>
                <p className="text-xs sm:text-sm text-gray-500">by {settings.company_name}</p>
              </div>
            </div>
            
            {isAdmin ? (
              <Link 
                href="/admin" 
                className="w-full sm:w-auto px-4 py-2 text-center text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm"
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-4 py-2 text-center text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 