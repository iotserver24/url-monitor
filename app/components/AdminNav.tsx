"use client"

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  ClipboardIcon, 
  Cog6ToothIcon, 
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  GlobeAltIcon 
} from '@heroicons/react/24/outline'
import { useEffect } from 'react'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    router.push('/login')
  }

  const navItems = [
    { href: '/admin', label: 'URLs', icon: ClipboardIcon },
    { href: '/admin/logs', label: 'Logs', icon: ChartBarIcon },
    { href: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon },
  ]

  return (
    <nav className="w-64 bg-white border-r border-secondary-200 p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-secondary-900">Admin Panel</h2>
      </div>
      
      <div className="flex flex-col justify-between h-[calc(100vh-120px)]">
        <ul className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center px-4 py-2 rounded-md ${
                  pathname === href
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-secondary-600 hover:bg-secondary-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center px-4 py-2 text-secondary-600 hover:bg-secondary-50 rounded-md"
          >
            <GlobeAltIcon className="h-5 w-5 mr-2" />
            Public Page
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
} 