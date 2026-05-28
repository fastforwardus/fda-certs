import React from 'react'
import { Document, Page, View, Text, Image, StyleSheet, Svg, Path } from '@react-pdf/renderer'
import { Certificate, CERT_TYPE_LABELS, PRODUCT_LABEL, HAS_PRODUCTS } from '@/types'
import QRCode from 'qrcode'

const FLAG  = 'https://flagcdn.com/w1280/us.png'
const LOGO  = 'https://fastfwdus.com/wp-content/uploads/2026/04/FF_Logo_01-2.png'
const SIG   = '/cert-assets/signature.png'

const N = '#0f2744'
const G = '#b8963e'

const CFR: Record<string, string> = {
  drug:        'Is registered with the US Food and Drug Administration pursuant to 21 CFR Part 207 — Requirements for Foreign and Domestic Establishment Registration and Drug Listing for Human Drugs, and the Drug Supply Chain Security Act (DSCSA), such registration having been verified as currently effective on the date hereof by Fast Forward:',
  food_initial:'Is registered with the US Food and Drug Administration pursuant to Section 415 of the Federal Food, Drug, and Cosmetic Act (21 U.S.C. § 350d) and 21 CFR Part 1, Subpart H — Registration of Food Facilities, as amended by the Bioterrorism Act of 2002 and the FDA Food Safety Modernization Act (FSMA), such registration having been verified as currently effective on the date hereof by Fast Forward:',
  food_renewal:'Is registered with the US Food and Drug Administration pursuant to Section 415 of the Federal Food, Drug, and Cosmetic Act (21 U.S.C. § 350d) and 21 CFR Part 1, Subpart H — Registration of Food Facilities, as amended by the Bioterrorism Act of 2002 and the FDA Food Safety Modernization Act (FSMA), such registration having been verified as currently effective on the date hereof by Fast Forward:',
  food_low_acid:'Is registered with the US Food and Drug Administration pursuant to 21 CFR Part 108 — Emergency Permit Control, and 21 CFR Parts 113 and 114 — Thermally Processed Low-Acid Foods Packaged in Hermetically Sealed Containers (LACF), such registration having been verified as currently effective on the date hereof by Fast Forward:',
  mocra:       'Is registered with the US Food and Drug Administration pursuant to the Modernization of Cosmetics Regulation Act of 2022 (MoCRA), Section 607 of the Federal Food, Drug, and Cosmetic Act (21 U.S.C. § 364b), and 21 CFR Part 730 — Registration and Listing of Cosmetic Product Facilities and Products, such registration having been verified as currently effective on the date hereof by Fast Forward:',
}

const DISC: Record<string, string> = {
  drug:        'This certificate affirms that the above stated establishment is registered with the US Food and Drug Administration pursuant to Section 510 of the FD&C Act (21 U.S.C. § 360) and 21 CFR Part 207. Registration does not constitute FDA endorsement or approval of any drug product. FastForward makes no other representations or warranties. The US FDA does not issue or recognize a certificate of registration. FastForward is not affiliated with the US Food and Drug Administration.',
  food_initial:'This certificate affirms that the above stated facility is registered with the US Food and Drug Administration pursuant to Section 415 of the FD&C Act and 21 CFR Part 1, Subpart H. Registration does not constitute FDA approval of any food product. FastForward makes no other representations or warranties. The US FDA does not issue or recognize a certificate of registration. FastForward is not affiliated with the US Food and Drug Administration.',
  food_renewal:'This certificate affirms that the above stated facility is registered with the US Food and Drug Administration pursuant to Section 415 of the FD&C Act and 21 CFR Part 1, Subpart H. Registration does not constitute FDA approval of any food product. FastForward makes no other representations or warranties. The US FDA does not issue or recognize a certificate of registration. FastForward is not affiliated with the US Food and Drug Administration.',
  food_low_acid:'This certificate affirms that the above stated establishment is registered with the US Food and Drug Administration pursuant to 21 CFR Parts 108, 113 and 114. LACF registration is mandatory for manufacturers of thermally processed low-acid foods for the US market. Registration does not constitute FDA approval of any specific product or process. FastForward makes no other representations or warranties. FastForward is not affiliated with the US Food and Drug Administration.',
  mocra:       'This certificate affirms that the above stated facility is registered with the US Food and Drug Administration pursuant to MoCRA and 21 CFR Part 730. Cosmetic facility registration became mandatory under MoCRA for facilities that manufacture or process cosmetic products for distribution in the United States. Registration does not constitute FDA approval or endorsement of any cosmetic product. FastForward makes no other representations or warranties. The US FDA does not issue or recognize a certificate of registration. FastForward is not affiliated with the US Food and Drug Administration.',
}

const s = StyleSheet.create({
  page:      { backgroundColor: '#e8e2d0', fontFamily: 'Times-Roman' },
  frame:     { margin: 10, borderWidth: 7, borderColor: N, padding: 4 },
  g1:        { borderWidth: 3, borderColor: G, padding: 3 },
  g2:        { borderWidth: 1, borderColor: G },
  flagBanner:{ width: '100%', height: 46 },
  flagRule:  { height: 2, backgroundColor: G },
  content:   { paddingHorizontal: 28, paddingTop: 10, paddingBottom: 14, backgroundColor: '#fff',
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Ccircle cx='24' cy='24' r='20' fill='none' stroke='%23c8c8d8' stroke-width='0.3'/%3E%3C/svg%3E\")" },
  h1:        { fontFamily: 'Times-Bold', fontSize: 18, textAlign: 'center', color: '#111', letterSpacing: 1.5, marginBottom: 2 },
  hfda:      { fontFamily: 'Times-Bold', fontSize: 13, textAlign: 'center', color: '#111', letterSpacing: 0.8, marginBottom: 2 },
  h2:        { fontFamily: 'Times-Bold', fontSize: 13, textAlign: 'center', color: '#111', marginBottom: 2 },
  valid:     { fontSize: 12, textAlign: 'center', color: '#111', marginTop: 4, fontFamily: 'Times-Roman' },
  dv:        { height: 1, backgroundColor: '#333', marginVertical: 8 },
  certRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  italic:    { fontFamily: 'Times-Italic', fontSize: 12, color: '#111' },
  bold9:     { fontFamily: 'Times-Bold', fontSize: 10, color: '#111', letterSpacing: 0.5 },
  company:   { fontFamily: 'Times-BoldItalic', fontSize: 13.5, textAlign: 'center', color: '#111', marginVertical: 3 },
  para:      { fontFamily: 'Times-Italic', fontSize: 10, lineHeight: 1.75, color: '#111', textAlign: 'justify', marginBottom: 9 },
  fRow:      { flexDirection: 'row', marginBottom: 4 },
  fLabel:    { fontFamily: 'Times-BoldItalic', fontSize: 10, width: 120, color: '#111', flexShrink: 0 },
  fVal:      { fontFamily: 'Times-Roman', fontSize: 10, flex: 1, color: '#111' },
  tHead:     { flexDirection: 'row', backgroundColor: N, paddingVertical: 5, paddingHorizontal: 8, marginTop: 8 },
  tHdTxt:    { color: G, fontSize: 8, letterSpacing: 1.5, fontFamily: 'Times-Bold' },
  tRow:      { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingVertical: 5, paddingHorizontal: 8 },
  tRowAlt:   { backgroundColor: '#f8f6f0' },
  tProd:     { flex: 1, fontSize: 9.5, color: '#111', fontFamily: 'Times-Roman' },
  tId:       { width: 100, fontSize: 9, fontFamily: 'Courier', color: '#333' },
  disc:      { fontSize: 6.5, color: '#888', textAlign: 'justify', lineHeight: 1.55, marginTop: 10, fontFamily: 'Times-Italic' },
  footer:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#555' },
  fLogo:     { width: 110, height: 32, objectFit: 'contain' },
  fQrWrap:   { alignItems: 'center', gap: 3 },
  fQr:       { width: 64, height: 64 },
  fQrLbl:    { fontSize: 7, color: '#888', textAlign: 'center', fontFamily: 'Times-Roman' },
  fSig:      { alignItems: 'flex-end' },
  sigImg:    { width: 110, height: 40, objectFit: 'contain', marginBottom: 2 },
  sigRule:   { width: 110, height: 0.8, backgroundColor: '#111', marginBottom: 3 },
  sigName:   { fontFamily: 'Times-Bold', fontSize: 10, color: '#111', textAlign: 'right' },
  sigTitle:  { fontSize: 8, color: '#666', textAlign: 'right', fontFamily: 'Times-Roman' },
  cHdr:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: G },
  pgNum:     { fontSize: 7, color: '#aaa', textAlign: 'right', marginBottom: 3, fontFamily: 'Times-Roman' },
})

async function makeQR(url: string): Promise<string> {
  return QRCode.toDataURL(url, { width: 128, margin: 1, color: { dark: N, light: '#ffffff' } })
}

function F({ label, value }: { label: string; value: string }) {
  return <View style={s.fRow}><Text style={s.fLabel}>{label}</Text><Text style={s.fVal}>{value}</Text></View>
}

interface PP { cert: Certificate; qr: string; isEs: boolean; products: Certificate['products']; pageNum: number; totalPages: number; appUrl: string }

function CertPage({ cert, qr, isEs, products, pageNum, totalPages, appUrl }: PP) {
  const typeName  = CERT_TYPE_LABELS[cert.type]
  const paraText  = CFR[cert.type]  || CFR.food_initial
  const discText  = DISC[cert.type] || DISC.food_initial
  const validDate = new Date(cert.expiry_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const issueDate = new Date(cert.issue_date).toLocaleDateString('en-US',  { month: '2-digit', day: '2-digit', year: 'numeric' })
  const prodLabel = PRODUCT_LABEL[cert.type]
  const pageProds = pageNum === 1 ? (products||[]).slice(0,8) : (products||[]).slice(8)
  const hasMore   = pageNum === 1 && (products||[]).length > 8

  return (
    <Page size="LETTER" style={s.page}>
      <View style={s.frame}><View style={s.g1}><View style={s.g2}>

        {/* Flag banner full width */}
        <Image src={FLAG} style={s.flagBanner} />
        <View style={s.flagRule} />

        <View style={s.content}>
          {totalPages > 1 && <Text style={s.pgNum}>Page {pageNum} of {totalPages}</Text>}

          {pageNum === 1 ? (<>
            <Text style={s.h1}>CERTIFICATE OF REGISTRATION</Text>
            <Text style={s.hfda}>US Food & Drug Administration (FDA)</Text>
            <Text style={s.h2}>{typeName}</Text>
            <Text style={s.valid}>Valid: {'   '}<Text style={{ fontFamily: 'Times-Bold' }}>{validDate}</Text></Text>
          </>) : (
            <View style={s.cHdr}>
              <View>
                <Text style={{ fontFamily: 'Times-Bold', fontSize: 12, color: N }}>Certificate of Registration — Continuation</Text>
                <Text style={{ fontSize: 9, color: '#555', marginTop: 2, fontFamily: 'Times-Roman' }}>{typeName} · {cert.company_name}</Text>
                <Text style={{ fontSize: 9, color: '#888', marginTop: 1, fontFamily: 'Times-Roman' }}>Reg: {cert.registration_number} · Valid: {validDate} · Issued: {issueDate}</Text>
              </View>
            </View>
          )}

          <View style={s.dv} />

          {pageNum === 1 && (<>
            <View style={s.certRow}>
              <Text style={s.italic}>{isEs ? 'Este certificado confirma que:' : 'This certifies that:'}</Text>
            </View>
            <Text style={s.company}>{cert.company_name}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: -2, marginBottom: 8 }}>
              <Text style={s.bold9}>ISSUED: {issueDate}</Text>
            </View>
            <Text style={s.para}>{paraText}</Text>
            <F label="Registration Number:" value={cert.registration_number} />
            <F label="Facility Address:" value={cert.facility_address} />
            <F label="DUNS #:" value={cert.duns_number || 'N/A'} />
            <F label="US Agent:" value="FASTFORWARD TRADING COMPANY, LLC" />
            <F label="" value="US AGENT ID: USID0408350" />
            <F label="" value="33 SW 2nd Ave, Ste 702, Miami, Florida, United States" />
          </>)}

          {pageNum === 2 && (
            <Text style={{ ...s.para, marginBottom: 8 }}>
              {`Additional registered products — continuation of certificate issued on ${issueDate}:`}
            </Text>
          )}

          {pageProds && pageProds.length > 0 && HAS_PRODUCTS.includes(cert.type) && (<>
            <View style={s.tHead}>
              <Text style={{ ...s.tHdTxt, flex: 1 }}>Product / Item</Text>
              <Text style={{ ...s.tHdTxt, width: 100 }}>{prodLabel}</Text>
            </View>
            {pageProds.map((p, i) => (
              <View key={p.id} style={[s.tRow, i % 2 === 1 ? s.tRowAlt : {}]}>
                <Text style={s.tProd}>{p.product_name}</Text>
                <Text style={s.tId}>{p.product_id}</Text>
              </View>
            ))}
            {hasMore && <Text style={{ fontSize: 8, color: N, fontFamily: 'Times-Italic', marginTop: 4 }}>→ Continued on page 2</Text>}
          </>)}

          <Text style={s.disc}>{discText}</Text>

          <View style={s.footer}>
            <Image src={LOGO} style={s.fLogo} />
            <View style={s.fQrWrap}>
              <Image src={qr} style={s.fQr} />
              <Text style={s.fQrLbl}>Scan to validate</Text>
            </View>
            <View style={s.fSig}>
              <Image src={`${appUrl}/cert-assets/signature.png`} style={s.sigImg} />
              <View style={s.sigRule} />
              <Text style={s.sigName}>Carlos Bisio</Text>
              <Text style={s.sigTitle}>US Agent</Text>
            </View>
          </View>
        </View>

      </View></View></View>
    </Page>
  )
}

export async function generateCertificatePDF(cert: Certificate, appUrl: string): Promise<Buffer> {
  const { renderToBuffer } = await import('@react-pdf/renderer')
  const qr         = await makeQR(`${appUrl}/validate?credential=${cert.validation_id}`)
  const isEs       = cert.language === 'es'
  const products   = cert.products || []
  const totalPages = HAS_PRODUCTS.includes(cert.type) && products.length > 8 ? 2 : 1
  const doc = React.createElement(Document,
    { title: `FDA Certificate — ${cert.company_name}`, author: 'FastForward Trading Company' },
    React.createElement(CertPage, { cert, qr, isEs, products, pageNum: 1, totalPages, appUrl }),
    ...(totalPages === 2 ? [React.createElement(CertPage, { cert, qr, isEs, products, pageNum: 2, totalPages, appUrl })] : [])
  )
  return Buffer.from(await renderToBuffer(doc))
}
