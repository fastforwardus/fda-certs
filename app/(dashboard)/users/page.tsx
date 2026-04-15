import { getSession } from '@/lib/auth'
import { getAllUsers, getUserStats } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const session = await getSession()
  if (session?.role !== 'admin') redirect('/')

  const users = await getAllUsers()
  const usersWithStats = await Promise.all(
    users.map(async (u: { id: string; name: string; email: string; role: string; created_at: string }) => ({
      ...u,
      stats: await getUserStats(u.id),
    }))
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} users in the platform</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {usersWithStats.map((u) => {
          const initials = u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          const avatarColor = u.role === 'admin' ? '#1a3a5c' : u.name.includes('Tomas') ? '#185FA5' : '#0F6E56'

          return (
            <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                  style={{ background: avatarColor }}
                >
                  {initials}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-sm text-gray-400">{u.email}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  u.role === 'admin' ? 'bg-[#1a3a5c] text-[#c9a84c]' : 'bg-blue-50 text-blue-700'
                }`}>
                  {u.role}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatBox label="Total certs" value={u.stats.total} />
                <StatBox label="Active" value={u.stats.active} color="green" />
                <StatBox label="Expiring" value={u.stats.expiring} color={u.stats.expiring > 0 ? 'amber' : undefined} />
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Member since {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  const vColor = color === 'green' ? 'text-green-700' : color === 'amber' ? 'text-amber-700' : 'text-gray-900'
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className={`text-xl font-semibold ${vColor}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}
