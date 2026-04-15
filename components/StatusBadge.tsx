import { CertStatus, CertType, CERT_TYPE_DISPLAY } from '@/types'

export default function StatusBadge({ status }: { status: CertStatus }) {
  const map = {
    active: 'bg-green-100 text-green-800',
    expiring: 'bg-amber-100 text-amber-800',
    expired: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || ''}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
