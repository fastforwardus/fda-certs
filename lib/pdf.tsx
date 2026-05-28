import React from 'react'
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { Certificate, CERT_TYPE_LABELS, PRODUCT_LABEL, HAS_PRODUCTS } from '@/types'
import QRCode from 'qrcode'

const EAGLE = 'https://pngimg.com/uploads/usa_gerb/usa_gerb_PNG4.png'
const FLAG  = 'https://flagcdn.com/w320/us.png'
const LOGO  = 'https://fastfwdus.com/wp-content/uploads/2026/04/FF_Logo_01-2.png'
const N = '#0f2744'
const G = '#b8963e'

const CFR_TEXT: Record<string, string> = {
  drug: 'Is registered with the US Food and Drug Administration (FDA) pursuant to 21 CFR Part 207 — Requirements for Foreign and Domestic Establishment Registration and Drug Listing for Human Drugs, and the Drug Supply Chain Security Act (DSCSA). Such registration has been verified as currently effective on the date hereof by Fast Forward:',
  food_initial: 'Is registered with the US Food and Drug Administration (FDA) pursuant to Section 415 of the Federal Food, Drug, and Cosmetic Act (21 U.S.C. § 350d) and 21 CFR Part 1, Subpart H — Registration of Food Facilities, as amended by the Bioterrorism Act of 2002 and the FDA Food Safety Modernization Act (FSMA). Such registration has been verified as currently effective on the date hereof by Fast Forward:',
  food_renewal: 'Is registered with the US Food and Drug Administration (FDA) pursuant to Section 415 of the Federal Food, Drug, and Cosmetic Act (21 U.S.C. § 350d) and 21 CFR Part 1, Subpart H — Registration of Food Facilities, as amended by the Bioterrorism Act of 2002 and the FDA Food Safety Modernization Act (FSMA). Such registration has been verified as currently effective on the date hereof by Fast Forward:',
  food_low_acid: 'Is registered with the US Food and Drug Administration (FDA) pursuant to 21 CFR Part 108 — Emergency Permit Control, and 21 CFR Parts 113 and 114 — Thermally Processed Low-Acid Foods Packaged in Hermetically Sealed Containers (LACF). Such registration has been verified as currently effective on the date hereof by Fast Forward:',
  mocra: 'Is registered with the US Food and Drug Administration (FDA) pursuant to the Modernization of Cosmetics Regulation Act of 2022 (MoCRA), Section 607 of the Federal Food, Drug, and Cosmetic Act (21 U.S.C. § 364b), and 21 CFR Part 730 — Registration and Listing of Cosmetic Product Facilities and Products. Such registration has been verified as currently effective on the date hereof by Fast Forward:',
}

const DISC_TEXT: Record<string, string> = {
  drug: 'This certificate affirms that the above stated establishment is registered with the US Food and Drug Administration pursuant to Section 510 of the Federal Food, Drug, and Cosmetic Act (21 U.S.C. § 360) and 21 CFR Part 207. Drug establishment registration is required for manufacturers, repackers, relabelers, and salvagers of drugs for human or animal use. Registration does not constitute an endorsement or approval of any drug product by the FDA. FastForward makes no representations or warranties beyond confirming the registration status as of the date hereof. FastForward is not affiliated with, endorsed by, or acting on behalf of the US Food and Drug Administration.',
  food_initial: 'This certificate affirms that the above stated facility is registered with the US Food and Drug Administration pursuant to Section 415 of the FD&C Act and 21 CFR Part 1, Subpart H. Registration is required for domestic and foreign facilities that manufacture, process, pack, or hold food for human or animal consumption in the United States. Registration does not constitute FDA approval, endorsement, or certification of any food product or facility. FastForward makes no representations or warranties beyond confirming the registration status as of the date hereof. FastForward is not affiliated with the US Food and Drug Administration.',
  food_renewal: 'This certificate affirms that the above stated facility is registered with the US Food and Drug Administration pursuant to Section 415 of the FD&C Act and 21 CFR Part 1, Subpart H. Registration is required for domestic and foreign facilities that manufacture, process, pack, or hold food for human or animal consumption in the United States. Registration does not constitute FDA approval, endorsement, or certification of any food product or facility. FastForward makes no representations or warranties beyond confirming the registration status as of the date hereof. FastForward is not affiliated with the US Food and Drug Administration.',
  food_low_acid: 'This certificate affirms that the above stated establishment is registered with the US Food and Drug Administration pursuant to 21 CFR Parts 108, 113 and 114. LACF registration is mandatory for manufacturers of thermally processed low-acid foods in hermetically sealed containers intended for the US market. The registration number (SID) is assigned per scheduled process filed with FDA. Registration does not constitute FDA approval of any specific product or process. FastForward makes no representations or warranties beyond confirming the registration status as of the date hereof. FastForward is not affiliated with the US Food and Drug Administration.',
  mocra: 'This certificate affirms that the above stated facility is registered with the US Food and Drug Administration pursuant to the Modernization of Cosmetics Regulation Act of 2022 (MoCRA) and 21 CFR Part 730. Cosmetic facility registration became mandatory under MoCRA for owners and operators of facilities that manufacture or process cosmetic products for distribution in the United States. Registration does not constitute FDA approval, certification, or endorsement of any cosmetic product. FastForward makes no representations or warranties beyond confirming the registration status as of the date hereof. FastForward is not affiliated with the US Food and Drug Administration.',
}

const TOPBAR_TEXT: Record<string, string> = {
  drug: 'Drug Establishment Registration',
  food_initial: 'Food Facility Registration',
  food_renewal: 'Food Facility Renewal Registration',
  food_low_acid: 'Low Acid Canned Food Establishment Registration',
  mocra: 'Cosmetic Facility Registration (MoCRA)',
}

const s = StyleSheet.create({
  page:       { backgroundColor: '#e8e2d0', fontFamily: 'Times-Roman' },
  frame:      { margin: 10, borderWidth: 7, borderColor: N, padding: 4 },
  g1:         { borderWidth: 3, borderColor: G, padding: 3 },
  g2:         { borderWidth: 1, borderColor: G },
  topbar:     { backgroundColor: N, paddingVertical: 7, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  topbarFlag: { width: 36, height: 24 },
  topbarTxt:  { color: G, fontSize: 7.5, letterSpacing: 2.5, fontFamily: 'Times-Roman' },
  paper:      { backgroundColor: '#fffef9', paddingHorizontal: 34, paddingTop: 16, paddingBottom: 14 },
  emblems:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 10 },
  eagle:      { width: 80, height: 64 },
  h1:         { fontFamily: 'Times-Bold', fontSize: 20, textAlign: 'center', color: N, letterSpacing: 2, marginBottom: 3 },
  h2:         { fontFamily: 'Times-Roman', fontSize: 12, textAlign: 'center', color: '#444', marginBottom: 2 },
  valid:      { fontSize: 11.5, textAlign: 'center', color: N, marginTop: 5 },
  goldRule:   { height: 2, backgroundColor: G, marginVertical: 8 },
  thinRule:   { height: 0.5, backgroundColor: G, marginVertical: 6, opacity: 0.4 },
  row2:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  italic:     { fontFamily: 'Times-Italic', fontSize: 11, color: '#333' },
  bold9:      { fontFamily: 'Times-Bold', fontSize: 9, color: '#555', letterSpacing: 0.8 },
  company:    { fontFamily: 'Times-BoldItalic', fontSize: 14.5, textAlign: 'center', color: N, marginVertical: 5 },
  para:       { fontFamily: 'Times-Italic', fontSize: 9.5, lineHeight: 1.75, color: '#333', textAlign: 'justify', marginBottom: 9 },
  fRow:       { flexDirection: 'row', marginBottom: 4 },
  fLabel:     { fontFamily: 'Times-BoldItalic', fontSize: 9.5, width: 118, color: N, flexShrink: 0 },
  fVal:       { fontFamily: 'Times-Roman', fontSize: 9.5, flex: 1, color: '#111' },
  tHead:      { flexDirection: 'row', backgroundColor: N, paddingVertical: 5, paddingHorizontal: 10, marginTop: 8 },
  tHdTxt:     { color: G, fontSize: 8, letterSpacing: 1.5, fontFamily: 'Times-Bold' },
  tRow:       { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingVertical: 5, paddingHorizontal: 10 },
  tRowAlt:    { backgroundColor: '#f8f6f0' },
  tProd:      { flex: 1, fontSize: 9.5, color: '#111', fontFamily: 'Times-Roman' },
  tId:        { width: 100, fontSize: 9, fontFamily: 'Courier', color: '#333' },
  disc:       { fontSize: 6.5, color: '#bbb', textAlign: 'justify', lineHeight: 1.6, marginTop: 10, fontFamily: 'Times-Italic' },
  footer:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12, paddingTop: 10, borderTopWidth: 2, borderTopColor: G },
  fLogo:      { width: 110, height: 32, objectFit: 'contain' },
  fQrWrap:    { alignItems: 'center', gap: 3 },
  fQr:        { width: 64, height: 64 },
  fQrLbl:     { fontSize: 7, color: '#aaa', textAlign: 'center', fontFamily: 'Times-Roman', letterSpacing: 0.5 },
  fSig:       { alignItems: 'flex-end' },
  sigLine:    { width: 110, height: 0.8, backgroundColor: N, marginBottom: 3 },
  sigName:    { fontFamily: 'Times-Bold', fontSize: 10, color: N, textAlign: 'right' },
  sigTitle:   { fontSize: 8, color: '#777', textAlign: 'right', fontFamily: 'Times-Roman' },
  botbar:     { backgroundColor: N, paddingVertical: 6, paddingHorizontal: 20, textAlign: 'center' },
  botbarTxt:  { color: 'rgba(184,150,62,0.4)', fontSize: 7, letterSpacing: 2, fontFamily: 'Times-Roman' },
  cHdr:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1.5, borderBottomColor: G },
  cEagle:     { width: 48, height: 38, opacity: 0.6 },
  pgNum:      { fontSize: 7.5, color: '#bbb', textAlign: 'right', marginBottom: 3, fontFamily: 'Times-Roman' },
})

async function makeQR(url: string): Promise<string> {
  return QRCode.toDataURL(url, { width: 128, margin: 1, color: { dark: N, light: '#ffffff' } })
}

function F({ label, value }: { label: string; value: string }) {
  return <View style={s.fRow}><Text style={s.fLabel}>{label}</Text><Text style={s.fVal}>{value}</Text></View>
}

interface PP { cert: Certificate; qr: string; isEs: boolean; products: Certificate['products']; pageNum: number; totalPages: number }

function CertPage({ cert, qr, isEs, products, pageNum, totalPages }: PP) {
  const typeName  = CERT_TYPE_LABELS[cert.type]
  const topbar    = TOPBAR_TEXT[cert.type] || typeName
  const paraText  = CFR_TEXT[cert.type] || CFR_TEXT.food_initial
  const discText  = DISC_TEXT[cert.type] || DISC_TEXT.food_initial
  const validDate = new Date(cert.expiry_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const issueDate = new Date(cert.issue_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const prodLabel = PRODUCT_LABEL[cert.type]
  const pageProds = pageNum === 1 ? (products||[]).slice(0,8) : (products||[]).slice(8)
  const hasMore   = pageNum === 1 && (products||[]).length > 8

  return (
    <Page size="LETTER" style={s.page}>
      <View style={s.frame}><View style={s.g1}><View style={s.g2}>

        {/* Top bar — V5 style: flags + type name */}
        <View style={s.topbar}>
          <Image src={FLAG} style={s.topbarFlag} />
          <Text style={s.topbarTxt}>{topbar.toUpperCase()}</Text>
          <Image src={FLAG} style={s.topbarFlag} />
        </View>

        <View style={s.paper}>
          {totalPages > 1 && <Text style={s.pgNum}>Page {pageNum} of {totalPages}</Text>}

          {pageNum === 1 ? (<>
            <View style={s.emblems}>
              <Image src={EAGLE} style={s.eagle} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={s.h1}>Certificate of Registration</Text>
                <Text style={s.h2}>{typeName}</Text>
                <Text style={s.valid}>
                  {isEs ? 'Válido hasta:' : 'Valid through:'}{' '}
                  <Text style={{ fontFamily: 'Times-Bold' }}>{validDate}</Text>
                </Text>
              </View>
              <Image src={EAGLE} style={s.eagle} />
            </View>
          </>) : (
            <View style={s.cHdr}>
              <View>
                <Text style={{ fontFamily: 'Times-Bold', fontSize: 12, color: N }}>Certificate of Registration — Continuation</Text>
                <Text style={{ fontSize: 9, color: '#555', marginTop: 2, fontFamily: 'Times-Roman' }}>{typeName} · {cert.company_name}</Text>
                <Text style={{ fontSize: 9, color: '#888', marginTop: 1, fontFamily: 'Times-Roman' }}>Reg: {cert.registration_number} · Valid: {validDate} · Issued: {issueDate}</Text>
              </View>
              <Image src={EAGLE} style={s.cEagle} />
            </View>
          )}

          <View style={s.goldRule} />

          {pageNum === 1 && (<>
            <View style={s.row2}>
              <Text style={s.italic}>{isEs ? 'Este certificado confirma que:' : 'This certifies that:'}</Text>
              <Text style={s.bold9}>ISSUED: {issueDate}</Text>
            </View>
            <Text style={s.company}>{cert.company_name}</Text>
            <View style={s.goldRule} />
            <Text style={s.para}>{paraText}</Text>
            <F label={isEs ? 'Número de Registro:' : 'Registration Number:'} value={cert.registration_number} />
            <F label={isEs ? 'Dirección:' : 'Facility Address:'} value={cert.facility_address} />
            <F label="DUNS #:" value={cert.duns_number || 'N/A'} />
            <F label={isEs ? 'Agente en EE.UU.:' : 'US Agent:'} value="FASTFORWARD TRADING COMPANY, LLC" />
            <F label="" value="US AGENT ID: USID0408350" />
            <F label="" value="33 SW 2nd Ave, Ste 702, Miami, Florida, United States" />
          </>)}

          {pageNum === 2 && (
            <Text style={{ ...s.para, marginBottom: 8 }}>
              {isEs ? `Productos adicionales — continuación del certificado emitido el ${issueDate}:` : `Additional registered products — continuation of certificate issued on ${issueDate}:`}
            </Text>
          )}

          {pageProds && pageProds.length > 0 && HAS_PRODUCTS.includes(cert.type) && (<>
            <View style={s.thinRule} />
            <View style={s.tHead}>
              <Text style={{ ...s.tHdTxt, flex: 1 }}>{isEs ? 'Producto / Artículo' : 'Product / Item'}</Text>
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
              <Text style={s.fQrLbl}>{isEs ? 'Escanear para validar' : 'Scan to validate'}</Text>
            </View>
            <View style={s.fSig}>
              <Image src="https://fda-certs.vercel.app/cert-assets/signature.png" style={{width:110,height:36,objectFit:"contain",marginBottom:2}}/>
              <View style={s.sigLine} />
              <Text style={s.sigName}>Carlos Bisio</Text>
              <Text style={s.sigTitle}>US Agent</Text>
              <Text style={s.sigTitle}>FastForward Trading Company, LLC</Text>
            </View>
          </View>
        </View>

        <View style={s.botbar}>
          <Text style={s.botbarTxt}>FASTFORWARD TRADING COMPANY, LLC  ·  33 SW 2ND AVE, STE 702, MIAMI, FLORIDA  ·  FASTFWDUS.COM</Text>
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
    React.createElement(CertPage, { cert, qr, isEs, products, pageNum: 1, totalPages }),
    ...(totalPages === 2 ? [React.createElement(CertPage, { cert, qr, isEs, products, pageNum: 2, totalPages })] : [])
  )
  return Buffer.from(await renderToBuffer(doc))
}
