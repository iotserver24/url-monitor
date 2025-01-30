import AdminNav from '../components/AdminNav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <AdminNav />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 