import { getSession } from '@/lib/auth'
import { getCertificates } from '@/lib/db'
import Link from 'next/link'
import { Certificate } from '@/types'
import CertificatesClient from './CertificatesClient'

export default async function CertificatesPage() {
  const session = await getSession()
  const isAdmin = session?.role === 'admin'
  const certs = await getCertificates(session?.userId, isAdmin) as Certificate[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isAdmin ? 'All Certificates' : 'My Certificates'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{certs.length} certificate{certs.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link href="/certificates/new" className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New certificate
        </Link>
      </div>
      <CertificatesClient certs={certs} isAdmin={isAdmin} />
    </div>
  )
}
