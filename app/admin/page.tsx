"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import UrlList from '../components/UrlList'
import AddUrlForm from '../components/AddUrlForm'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function AdminPage() {
  const router = useRouter()
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/login')
      return
    }

    fetchUrls()
  }, [router])

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls', {
        headers: {
          'x-is-admin': 'true'
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch URLs')
      }

      const data = await response.json()
      setUrls(data)
    } catch (error) {
      console.error('Error fetching URLs:', error)
      toast.error('Failed to fetch URLs')
    } finally {
      setLoading(false)
    }
  }

  const handleUrlAdded = () => {
    setShowAddForm(false)
    fetchUrls()
  }

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Monitored URLs</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add URL
          </button>
        </div>

        {showAddForm && (
          <div className="mb-8">
            <AddUrlForm onUrlAdded={handleUrlAdded} onCancel={() => setShowAddForm(false)} />
          </div>
        )}

        {urls.length > 0 ? (
          <UrlList urls={urls} onUrlDeleted={fetchUrls} isAdmin={true} />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No URLs added</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a URL to monitor.</p>
            {!showAddForm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add URL
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

