import { NextRequest, NextResponse } from 'next/server'
import { getCertificateById } from '@/lib/db'
import { generateCertificatePDF } from '@/lib/pdf'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = req.headers.get('x-user-id')!
  const role = req.headers.get('x-user-role')!

  const cert = await getCertificateById(id)
  if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (role !== 'admin' && cert.created_by !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fastfwdus.com'
  const buffer = await generateCertificatePDF(cert, appUrl)
  const filename = `FDA_Certificate_${cert.cert_number}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
