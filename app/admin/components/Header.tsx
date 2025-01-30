"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ClipboardIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    router.push('/login')
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin"
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <ClipboardIcon className="h-5 w-5 mr-1" />
              Dashboard
            </Link>
            
            <Link 
              href="/admin/logs"
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <ClipboardIcon className="h-5 w-5 mr-1" />
              Logs
            </Link>

            <Link 
              href="/admin/settings"
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <Cog6ToothIcon className="h-5 w-5 mr-1" />
              Settings
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center text-sm font-medium text-red-600 hover:text-red-800"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
} 