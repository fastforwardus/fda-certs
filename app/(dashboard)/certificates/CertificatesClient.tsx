'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Certificate, CertType, CERT_TYPE_DISPLAY } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import TypeBadge from '@/components/TypeBadge'

const TYPES: CertType[] = ['food_initial', 'food_renewal', 'food_low_acid', 'mocra', 'drug', 'medical_device']

export default function CertificatesClient({ certs, isAdmin }: { certs: Certificate[]; isAdmin: boolean }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = certs.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.company_name.toLowerCase().includes(q) || c.cert_number.toLowerCase().includes(q) || c.registration_number.includes(q)
    const matchType = typeFilter === 'all' || c.type === typeFilter
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  async function downloadPDF(id: string, certNumber: string) {
    const a = document.createElement('a')
    a.href = `/api/certificates/${id}/pdf`
    a.download = `FDA_Certificate_${certNumber}.pdf`
    a.click()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      {/* Filters */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by company, ID or registration #…"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a3a5c] text-gray-700"
        >
          <option value="all">All types</option>
          {TYPES.map(t => <option key={t} value={t}>{CERT_TYPE_DISPLAY[t]}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a3a5c] text-gray-700"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="px-5 py-2.5 border-b border-gray-50">
        <p className="text-xs text-gray-400">{filtered.length} certificate{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">
          No certificates match your search.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs text-gray-400 font-medium px-5 py-3">ID</th>
                <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Type</th>
                <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Company</th>
                <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Reg #</th>
                {isAdmin && <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Created by</th>}
                <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Issued</th>
                <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Expires</th>
                <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Status</th>
                <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Pages</th>
                <th className="text-left text-xs text-gray-400 font-medium px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">{c.cert_number}</td>
                  <td className="px-3 py-3"><TypeBadge type={c.type} /></td>
                  <td className="px-3 py-3 text-gray-700 max-w-[160px] truncate">{c.company_name}</td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-500">{c.registration_number}</td>
                  {isAdmin && <td className="px-3 py-3 text-xs text-gray-500">{c.created_by_name}</td>}
                  <td className="px-3 py-3 text-xs text-gray-500">
                    {new Date(c.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">
                    {new Date(c.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-3 py-3">
                    {c.pages > 1 ? (
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">2 pages</span>
                    ) : (
                      <span className="text-xs text-gray-400">1 pg</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/certificates/${c.id}`} className="text-xs text-[#1a3a5c] hover:underline font-medium">View</Link>
                      <button
                        onClick={() => downloadPDF(c.id, c.cert_number)}
                        className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
