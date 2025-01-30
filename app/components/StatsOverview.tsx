export default function StatsOverview({ 
  totalUrls, 
  upUrls, 
  averageUptime 
}: { 
  totalUrls: number
  upUrls: number
  averageUptime: number
}) {
  return (
    <>
      <div className="bg-white rounded-lg shadow px-6 py-5">
        <dt className="text-sm font-medium text-gray-500 truncate">Total URLs</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalUrls}</dd>
      </div>

      <div className="bg-white rounded-lg shadow px-6 py-5">
        <dt className="text-sm font-medium text-gray-500 truncate">URLs Up</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">{upUrls} / {totalUrls}</dd>
      </div>

      <div className="bg-white rounded-lg shadow px-6 py-5">
        <dt className="text-sm font-medium text-gray-500 truncate">Average Uptime</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">{averageUptime.toFixed(2)}%</dd>
      </div>
    </>
  )
} 