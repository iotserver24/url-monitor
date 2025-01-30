"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Database } from "../../lib/database.types"

type Url = Database['public']['Tables']['urls']['Row']
type AdminPanelProps = {
  urls: Url[]
}

export default function AdminPanel({ urls }: AdminPanelProps) {
  const [localUrls, setLocalUrls] = useState<Url[]>(urls)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: "DELETE",
        headers: {
          'x-is-admin': 'true'
        }
      })

      if (response.ok) {
        setLocalUrls(prev => prev.filter(url => url.id !== id))
        router.refresh()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (!localUrls?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No URLs added yet</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-4">
        {localUrls.map((url) => (
          <div key={url.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-secondary-900">{url.name}</h2>
                <p className="text-secondary-600 mt-1">{url.url}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  url.status === "up" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {url.status}
                </span>
                <div className="text-sm">
                  <span className="text-secondary-500">Uptime:</span>
                  <span className="ml-1 font-semibold">{url.uptime.toFixed(2)}%</span>
                </div>
                <button
                  onClick={() => handleDelete(url.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

