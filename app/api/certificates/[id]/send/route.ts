import { NextRequest, NextResponse } from 'next/server'
import { getCertificateById } from '@/lib/db'
import { generateCertificatePDF } from '@/lib/pdf'
import { sendCertificateEmail } from '@/lib/email'

export async function POST(
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

  const { email, language } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fastfwdus.com'
  const pdfBuffer = await generateCertificatePDF(cert, appUrl)

  await sendCertificateEmail({
    to: email,
    certificate: cert,
    pdfBuffer,
    language: (language || cert.language || 'en') as 'en' | 'es',
  })

  return NextResponse.json({ ok: true })
}
