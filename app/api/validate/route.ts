import { NextRequest, NextResponse } from 'next/server'
import { getCertificateByValidationId } from '@/lib/db'
import { CERT_TYPE_LABELS } from '@/types'

export async function GET(req: NextRequest) {
  const credential = req.nextUrl.searchParams.get('credential')
  if (!credential) return NextResponse.json({ valid: false, error: 'No credential' }, { status: 400 })

  const cert = await getCertificateByValidationId(credential)
  if (!cert) return NextResponse.json({ valid: false, error: 'Certificate not found' }, { status: 404 })

  const isExpired = new Date(cert.expiry_date) < new Date()

  return NextResponse.json({
    valid: !isExpired,
    cert_number: cert.cert_number,
    type: CERT_TYPE_LABELS[cert.type],
    company: cert.company_name,
    registration_number: cert.registration_number,
    issued: cert.issue_date,
    expires: cert.expiry_date,
    status: cert.status,
    issued_by: 'FastForward Trading Company, LLC',
  })
}
