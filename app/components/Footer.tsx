"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export default function Footer() {
  const [settings, setSettings] = useState({
    companyName: "MegaVault",
    contactEmail: "support@megavault.in",
    showWatermark: true
  })
  const pathname = usePathname()

  useEffect(() => {
    async function getSettings() {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data) {
        setSettings(data)
      }
    }
    getSettings()
  }, [])

  return (
    <footer className="mt-16 border-t border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">Contact Us</h3>
            <p className="mt-2 text-secondary-600">
              <a href={`mailto:${settings.contactEmail}`} className="hover:text-primary-600">
                {settings.contactEmail}
              </a>
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">Company</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="#" className="text-secondary-600 hover:text-primary-600">About</a>
              </li>
              <li>
                <a href="#" className="text-secondary-600 hover:text-primary-600">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-secondary-600 hover:text-primary-600">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-secondary-200">
          <p className="text-center text-secondary-600">
            © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
          </p>
          {settings.showWatermark && (
            <p className="text-center text-sm text-secondary-500 mt-2">
              Powered by URL Monitor
            </p>
          )}
        </div>
      </div>
    </footer>
  )
} 