import { CertType, CERT_TYPE_DISPLAY } from '@/types'

export default function TypeBadge({ type }: { type: CertType }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
      {CERT_TYPE_DISPLAY[type] || type}
    </span>
  )
}
