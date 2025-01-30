'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Something went wrong!</h2>
      <p className="text-red-600 mb-4 text-center">{error.message}</p>
      <button
        onClick={() => reset()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Try again
      </button>
    </div>
  )
} 