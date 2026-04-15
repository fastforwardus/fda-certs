import { getSession } from '@/lib/auth'
import { getMetrics, getMonthlyStats, getUserStats, getCertificates } from '@/lib/db'
import Link from 'next/link'
import { Certificate } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import TypeBadge from '@/components/TypeBadge'

export default async function DashboardPage() {
  const session = await getSession()
  const isAdmin = session?.role === 'admin'

  const [certs, stats, monthly] = await Promise.all([
    getCertificates(session?.userId, isAdmin),
    isAdmin ? getMetrics() : getUserStats(session?.userId || ''),
    isAdmin ? getMonthlyStats() : Promise.resolve([]),
  ])

  const recent = (certs as Certificate[]).slice(0, 6)
  const maxMonth = monthly.length ? Math.max(...monthly.map((m: { count: string }) => parseInt(m.count))) : 1

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isAdmin ? 'Overview' : `Welcome, ${session?.name.split(' ')[0]}`}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin ? 'All certificates and activity across the platform' : 'Manage your FDA certificates'}
          </p>
        </div>
        {!isAdmin && (
          <Link href="/certificates/new" className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New certificate
          </Link>
        )}
      </div>

      {/* Metrics */}
      <div className={`grid gap-4 mb-6 ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
        {isAdmin ? (
          <>
            <MetricCard label="Total issued" value={stats.total} sub="All time" />
            <MetricCard label="Active" value={stats.active} sub="Valid today" color="green" />
            <MetricCard label="Expiring in 30d" value={stats.expiring} sub="Need renewal" color={stats.expiring > 0 ? 'amber' : undefined} />
            <MetricCard label="This month" value={(stats as { thisMonth?: number }).thisMonth ?? 0} sub={new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })} />
          </>
        ) : (
          <>
            <MetricCard label="Active certs" value={stats.active} sub="Valid today" color="green" />
            <MetricCard label="Expiring soon" value={stats.expiring} sub="Within 30 days" color={stats.expiring > 0 ? 'amber' : undefined} />
            <MetricCard label="Total created" value={stats.total} sub="All time" />
          </>
        )}
      </div>

      {isAdmin && monthly.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">Certificates issued — last 6 months</p>
            <div className="flex items-end gap-2 h-24">
              {monthly.map((m: { month: string; count: string }, i: number) => {
                const h = Math.round((parseInt(m.count) / maxMonth) * 80)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500 font-medium">{m.count}</span>
                    <div className="w-full bg-[#1a3a5c] rounded-t" style={{ height: h }} />
                    <span className="text-[10px] text-gray-400">{m.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">By type</p>
            <TypeDistribution certs={certs as Certificate[]} />
          </div>
        </div>
      )}

      {/* Recent certs table */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <p className="text-sm font-medium text-gray-700">
            {isAdmin ? 'Recent certificates' : 'My certificates'}
          </p>
          <Link href="/certificates" className="text-xs text-[#1a3a5c] hover:underline">
            View all →
          </Link>
        </div>
        <CertsTable certs={recent} isAdmin={isAdmin} />
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub, color }: { label: string; value: number; sub: string; color?: string }) {
  const valueColor = color === 'green' ? 'text-green-700' : color === 'amber' ? 'text-amber-700' : 'text-gray-900'
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
      <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

function TypeDistribution({ certs }: { certs: Certificate[] }) {
  const counts: Record<string, number> = {}
  certs.forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1 })
  const total = certs.length || 1
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-2.5">
      {entries.map(([type, count]) => (
        <div key={type}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500 capitalize">{type.replace(/_/g, ' ')}</span>
            <span className="font-medium text-gray-700">{count}</span>
          </div>
          <div className="bg-gray-100 h-1.5 rounded-full">
            <div className="bg-[#1a3a5c] h-1.5 rounded-full" style={{ width: `${Math.round((count / total) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function CertsTable({ certs, isAdmin }: { certs: Certificate[]; isAdmin: boolean }) {
  if (!certs.length) {
    return (
      <div className="text-center py-12 text-sm text-gray-400">
        No certificates yet.{' '}
        <Link href="/certificates/new" className="text-[#1a3a5c] hover:underline">Create your first one →</Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-50">
            <th className="text-left text-xs text-gray-400 font-medium px-5 py-3">ID</th>
            <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Type</th>
            <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Company</th>
            {isAdmin && <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">User</th>}
            <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Expires</th>
            <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Status</th>
            <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {certs.map(c => (
            <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3 font-mono text-xs text-gray-400">{c.cert_number}</td>
              <td className="px-3 py-3"><TypeBadge type={c.type} /></td>
              <td className="px-3 py-3 text-gray-700 max-w-[180px] truncate">{c.company_name}</td>
              {isAdmin && (
                <td className="px-3 py-3 text-gray-500 text-xs">{c.created_by_name}</td>
              )}
              <td className="px-3 py-3 text-xs text-gray-500">
                {new Date(c.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <Link href={`/certificates/${c.id}`} className="text-xs text-[#1a3a5c] hover:underline">View</Link>
                  <a href={`/api/certificates/${c.id}/pdf`} className="text-xs text-gray-500 hover:underline">PDF</a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
