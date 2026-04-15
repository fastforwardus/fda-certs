import { getSession } from '@/lib/auth'
import { getCertificateById } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { CERT_TYPE_LABELS } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import TypeBadge from '@/components/TypeBadge'
import CertificateActions from './CertificateActions'

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  const cert = await getCertificateById(id)

  if (!cert) notFound()
  if (session?.role !== 'admin' && cert.created_by !== session?.userId) redirect('/')

  const validationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/validate?credential=${cert.validation_id}`

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TypeBadge type={cert.type} />
            <StatusBadge status={cert.status} />
            {cert.pages > 1 && (
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">2-page PDF</span>
            )}
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{cert.company_name}</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-mono">{cert.cert_number}</p>
        </div>
      </div>

      {/* Actions */}
      <CertificateActions certId={cert.id} certNumber={cert.cert_number} language={cert.language} />

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-4">Certificate details</p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <DetailItem label="Certificate type" value={CERT_TYPE_LABELS[cert.type]} />
          <DetailItem label="Registration #" value={cert.registration_number} mono />
          <DetailItem label="DUNS #" value={cert.duns_number || 'N/A'} mono />
          <DetailItem label="Issue date" value={new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
          <DetailItem label="Expiry date" value={new Date(cert.expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
          <DetailItem label="Language" value={cert.language === 'en' ? 'English' : 'Español'} />
          <DetailItem label="US Agent" value="FastForward Trading Company, LLC" />
          <DetailItem label="Agent address" value="33 SW 2nd Ave, Ste 702, Miami, Florida, United States" />
        </dl>
        <div className="mt-3 pt-3 border-t border-gray-50">
          <DetailItem label="Facility address" value={cert.facility_address} />
        </div>
      </div>

      {/* Products */}
      {cert.products && cert.products.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Products ({cert.products.length})</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs text-gray-400 font-medium py-2">Product</th>
                <th className="text-left text-xs text-gray-400 font-medium py-2">ID</th>
                {cert.products.length > 8 && <th className="text-left text-xs text-gray-400 font-medium py-2">Page</th>}
              </tr>
            </thead>
            <tbody>
              {cert.products.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 text-gray-700">{p.product_name}</td>
                  <td className="py-2 font-mono text-xs text-gray-500">{p.product_id}</td>
                  {cert.products && cert.products.length > 8 && (
                    <td className="py-2 text-xs text-gray-400">{i < 8 ? 'Page 1' : 'Page 2'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Validation */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
        <p className="text-sm font-medium text-gray-700 mb-2">Validation URL</p>
        <p className="text-xs font-mono text-[#1a3a5c] break-all">{validationUrl}</p>
        <p className="text-xs text-gray-400 mt-1.5">This URL is embedded as a QR code in the printed certificate</p>
      </div>
    </div>
  )
}

function DetailItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
      <dd className={`text-gray-700 ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  )
}
