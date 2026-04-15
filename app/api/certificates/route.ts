import { NextRequest, NextResponse } from 'next/server'
import { getCertificates, getNextCertNumber, getCertificateById } from '@/lib/db'
import { neon } from '@neondatabase/serverless'
import { Certificate, CreateCertPayload, HAS_PRODUCTS } from '@/types'
import { generateCertificatePDF } from '@/lib/pdf'
import { sendCertificateEmail } from '@/lib/email'

function db() {
  return neon(process.env.DATABASE_URL!)
}

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')!
  const role = req.headers.get('x-user-role')!
  const certs = await getCertificates(userId, role === 'admin')
  return NextResponse.json(certs)
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')!

  try {
    const body: CreateCertPayload & { send_email?: boolean; recipient_email?: string } = await req.json()
    const {
      type, company_name, registration_number, duns_number,
      facility_address, expiry_date, language, products,
      send_email, recipient_email,
    } = body

    if (!type || !company_name || !registration_number || !facility_address || !expiry_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const sql = db()
    const certNumber = await getNextCertNumber()
    const pages = HAS_PRODUCTS.includes(type) && products && products.length > 8 ? 2 : 1

    const rows = await sql`
      INSERT INTO certificates (
        cert_number, type, company_name, registration_number, duns_number,
        facility_address, expiry_date, language, created_by, pages
      ) VALUES (
        ${certNumber}, ${type}, ${company_name}, ${registration_number},
        ${duns_number || 'N/A'}, ${facility_address}, ${expiry_date},
        ${language || 'en'}, ${userId}, ${pages}
      )
      RETURNING *`

    const cert = rows[0] as Certificate

    if (HAS_PRODUCTS.includes(type) && products && products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        const p = products[i]
        if (p.product_name && p.product_id) {
          await sql`
            INSERT INTO certificate_products (certificate_id, product_name, product_id, sort_order)
            VALUES (${cert.id}, ${p.product_name}, ${p.product_id}, ${i})`
        }
      }
      cert.products = products
        .filter(p => p.product_name && p.product_id)
        .map((p, i) => ({ id: String(i), certificate_id: cert.id, product_name: p.product_name, product_id: p.product_id, sort_order: i }))
    } else {
      cert.products = []
    }

    if (send_email && recipient_email) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fastfwdus.com'
        const pdfBuffer = await generateCertificatePDF(cert, appUrl)
        await sendCertificateEmail({ to: recipient_email, certificate: cert, pdfBuffer, language: (language || 'en') as 'en' | 'es' })
      } catch (err) {
        console.error('Email error:', err)
      }
    }

    return NextResponse.json(cert, { status: 201 })
  } catch (err) {
    console.error('Create cert error:', err)
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
  }
}
