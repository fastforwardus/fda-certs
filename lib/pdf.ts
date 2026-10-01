import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib'
import QRCode from 'qrcode'
import fs from 'fs/promises'
import path from 'path'
import { Certificate, CertType, HAS_PRODUCTS } from '@/types'

// ─── Templates (public/cert-templates) ───────────────────────────────────────
const TEMPLATE: Record<CertType, string> = {
  food_initial:   'Food-Facility-Registration.pdf',
  food_renewal:   'Food-Facility-Registration.pdf',
  food_low_acid:  'Low-Acid-Acidified-Foods.pdf',
  mocra:          'Cosmetics.pdf',
  drug:           'Drugs.pdf',
  medical_device: 'Medical-Devices.pdf',
}

const NAVY  = rgb(0.098, 0.176, 0.282)
const WHITE = rgb(1, 1, 1)
const PAGE_W = 612

// Field boxes taken from the template AcroForm (x0, y0, x1, y1 in PDF points)
const P1 = {
  issue:    { x: 269, y: 631, w: 93,  h: 15, size: 9, baseline: 1.5, bg: true },
  valid:    { x: 269, y: 611, w: 93,  h: 15, size: 9, baseline: 1.5, bg: true },
  company:  { x: 76,  y: 476, w: 460, h: 27, size: 18, bold: true },
  address:  { x: 76,  y: 432, w: 460, h: 17, size: 10 },
  city:     { x: 76,  y: 413, w: 460, h: 17, size: 10 },
  reg:      { x: 76,  y: 372, w: 254, h: 18, size: 10 },
  ufi:      { x: 357, y: 372, w: 179, h: 18, size: 10 },
  certNo:   { x: 183, y: 70,  w: 183, h: 17, size: 8 },
  prodY0:   286, // product row 1; each next row is 18pt lower (rows 1‑7)
}
const P2 = {
  issue:    { x: 140, y: 634, w: 110, h: 17, size: 9 },
  valid:    { x: 412, y: 634, w: 110, h: 17, size: 9 },
  company:  { x: 136, y: 603, w: 400, h: 20, size: 12, bold: true },
  certNo:   { x: 183, y: 70,  w: 183, h: 17, size: 8 },
  prodY0:   516, // product row 8; rows 8‑26 (19 rows)
}
const ROW_H   = 18
const PROD    = { x: 97,  w: 264, size: 9 }
const CODE    = { x: 369, w: 163, size: 8 }
const ROWS_P1 = 7
const ROWS_P2 = 19
const QR      = { x: 496, y: 696, size: 36 } // top‑right, inside the white area

// ─── helpers ─────────────────────────────────────────────────────────────────
type Box = { x: number; y: number; w: number; h: number; size: number; bold?: boolean; baseline?: number; bg?: boolean }

function fit(text: string, font: PDFFont, size: number, maxW: number, minSize = 6) {
  let s = size
  while (s > minSize && font.widthOfTextAtSize(text, s) > maxW) s -= 0.5
  if (font.widthOfTextAtSize(text, s) <= maxW) return { text, size: s }
  let t = text
  while (t.length > 1 && font.widthOfTextAtSize(t + '…', s) > maxW) t = t.slice(0, -1)
  return { text: t + '…', size: s }
}

function sanitize(s: string) {
  // Standard fonts only support WinAnsi; replace what they can't encode
  return (s || '').normalize('NFC').replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2026]/g, '?')
}

function drawBox(page: PDFPage, box: Box, value: string, reg: PDFFont, bold: PDFFont) {
  const font = box.bold ? bold : reg
  const { text, size } = fit(sanitize(value), font, box.size, box.w)
  // the template's date fields have a white background that hides the eagle's tail — replicate it
  if (box.bg) page.drawRectangle({ x: box.x, y: box.y, width: box.w, height: box.h, color: WHITE })
  // dates sit on the same baseline as the printed "ISSUE DATE:" / "VALID:" labels
  const y = box.baseline !== undefined ? box.y + box.baseline : box.y + (box.h - size) / 2 + size * 0.22
  page.drawText(text, { x: box.x, y, size, font, color: NAVY })
}

function drawRow(page: PDFPage, rowY: number, name: string, code: string, reg: PDFFont) {
  const p = fit(sanitize(name), reg, PROD.size, PROD.w)
  const c = fit(sanitize(code), reg, CODE.size, CODE.w)
  page.drawText(p.text, { x: PROD.x, y: rowY + (15 - p.size) / 2 + p.size * 0.22, size: p.size, font: reg, color: NAVY })
  page.drawText(c.text, { x: CODE.x, y: rowY + (15 - c.size) / 2 + c.size * 0.22, size: c.size, font: reg, color: NAVY })
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', timeZone: 'UTC' })
}

/** Split a single‑line address into [street, city/state/zip/country] */
export function splitAddress(addr: string): [string, string] {
  const a = (addr || '').trim()
  if (a.includes('\n')) {
    const [first, ...rest] = a.split('\n').map(s => s.trim()).filter(Boolean)
    return [first, rest.join(', ')]
  }
  const parts = a.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length <= 1) return [a, '']
  let cut = 1
  if (parts.length >= 3 && /^(ste|suite|unit|apt|#|piso|of\.?|oficina|local|dpto|depto|bodega|nave|floor|fl\b)/i.test(parts[1])) cut = 2
  return [parts.slice(0, cut).join(', '), parts.slice(cut).join(', ')]
}

function stripForm(doc: PDFDocument) {
  const form = doc.getForm()
  for (const f of form.getFields()) form.removeField(f)
}

function signatureTitle(page: PDFPage, times: PDFFont) {
  // template prints "CEO" under the signature; FastForward signs as US Agent
  const text = 'US Agent', size = 9
  const nameCenter = (448 + 505.1) / 2
  page.drawRectangle({ x: 470, y: 792 - 723, width: 30, height: 11, color: WHITE })
  page.drawText(text, { x: nameCenter - times.widthOfTextAtSize(text, size) / 2, y: 792 - 720.5, size, font: times, color: NAVY })
}

function pageLabel(page: PDFPage, n: number, reg: PDFFont) {
  // cover the static "Page 2" on copied continuation pages and redraw
  page.drawRectangle({ x: 508, y: 792 - 731, width: 30, height: 10, color: WHITE })
  page.drawText(`Page ${n}`, { x: 510, y: 792 - 729.4, size: 7, font: reg, color: rgb(0.2, 0.2, 0.2) })
}

function rowLabel(page: PDFPage, rowY: number, n: number | null, reg: PDFFont) {
  page.drawRectangle({ x: 79, y: rowY, width: 16, height: 11, color: WHITE })
  if (n !== null) page.drawText(`${n}.`, { x: 81, y: rowY + 4.4, size: 7, font: reg, color: rgb(0.45, 0.45, 0.45) })
}

// ─── main ────────────────────────────────────────────────────────────────────
export async function generateCertificatePDF(cert: Certificate, appUrl: string): Promise<Buffer> {
  const file  = path.join(process.cwd(), 'public', 'cert-templates', TEMPLATE[cert.type])
  const bytes = await fs.readFile(file)

  const doc = await PDFDocument.load(bytes)
  stripForm(doc)
  const reg  = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const times = await doc.embedFont(StandardFonts.TimesRoman)

  const products = HAS_PRODUCTS.includes(cert.type) ? (cert.products || []) : []
  const issue = fmtDate(cert.issue_date)
  const valid = fmtDate(cert.expiry_date)
  const [street, city] = splitAddress(cert.facility_address)

  // ── page 1
  const p1 = doc.getPage(0)
  drawBox(p1, P1.issue,   issue, reg, bold)
  drawBox(p1, P1.valid,   valid, reg, bold)
  drawBox(p1, P1.company, cert.company_name, reg, bold)
  drawBox(p1, P1.address, street, reg, bold)
  drawBox(p1, P1.city,    city, reg, bold)
  drawBox(p1, P1.reg,     cert.registration_number, reg, bold)
  drawBox(p1, P1.ufi,     cert.duns_number || 'N/A', reg, bold)
  drawBox(p1, P1.certNo,  cert.cert_number, reg, bold)
  products.slice(0, ROWS_P1).forEach((p, i) => drawRow(p1, P1.prodY0 - i * ROW_H, p.product_name, p.product_id, reg))

  // QR → public validation page
  const qrPng = await QRCode.toBuffer(`${appUrl}/validate?credential=${cert.validation_id}`, {
    width: 256, margin: 0, color: { dark: '#192d48', light: '#ffffff' },
  })
  const qrImg = await doc.embedPng(qrPng)
  p1.drawImage(qrImg, { x: QR.x, y: QR.y, width: QR.size, height: QR.size })

  // ── continuation pages
  const rest = products.slice(ROWS_P1)
  const hasP2 = doc.getPageCount() > 1
  if (rest.length === 0) {
    if (hasP2) doc.removePage(1)
  } else {
    const chunks: typeof rest[] = []
    for (let i = 0; i < rest.length; i += ROWS_P2) chunks.push(rest.slice(i, i + ROWS_P2))

    // extra continuation pages are copies of the template's page 2 (form already stripped)
    if (chunks.length > 1) {
      const src = await PDFDocument.load(bytes)
      stripForm(src)
      for (let k = 1; k < chunks.length; k++) {
        const [cp] = await doc.copyPages(src, [1])
        doc.addPage(cp)
      }
    }

    chunks.forEach((chunk, k) => {
      const pg = doc.getPage(1 + k)
      drawBox(pg, P2.issue,   issue, reg, bold)
      drawBox(pg, P2.valid,   valid, reg, bold)
      drawBox(pg, P2.company, cert.company_name, reg, bold)
      drawBox(pg, P2.certNo,  cert.cert_number, reg, bold)
      if (k > 0) {
        pageLabel(pg, 2 + k, reg)
        for (let i = 0; i < ROWS_P2; i++)
          rowLabel(pg, P2.prodY0 - i * ROW_H, i < chunk.length ? ROWS_P1 + k * ROWS_P2 + i + 1 : null, reg)
      }
      chunk.forEach((p, i) => drawRow(pg, P2.prodY0 - i * ROW_H, p.product_name, p.product_id, reg))
    })
  }

  for (const pg of doc.getPages()) signatureTitle(pg, times)

  doc.setTitle(`FDA Certificate — ${cert.company_name}`)
  doc.setAuthor('FastForward Trading Company, LLC')
  doc.setProducer('fda-certs')
  return Buffer.from(await doc.save({ useObjectStreams: true }))
}
