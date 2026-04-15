import React from 'react'
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { Certificate, CERT_TYPE_LABELS, PRODUCT_LABEL, HAS_PRODUCTS } from '@/types'
import QRCode from 'qrcode'

const EAGLE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Coat_of_arms_of_the_United_States.svg/300px-Coat_of_arms_of_the_United_States.svg.png'
const FLAG  = 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/240px-Flag_of_the_United_States.svg.png'
const LOGO  = 'https://fastfwdus.com/wp-content/uploads/2026/04/FF_Logo_01-2.png'
const NAVY  = '#1a3a5c'
const GOLD  = '#c9a84c'

const DISC = 'This certificate affirms that the above stated facility is registered with the US Food and Drug Administration pursuant to the Federal Food Drug and Cosmetic Act, as amended by the Bioterrorism Act of 2002 and the FDA Food Safety Modernization Act. Such registration remains effective upon request and presentation of this certificate until 1 year after issuance date, unless such registration has been terminated. FastForward makes no other representations or warranties. The US FDA does not issue or recognize certificates of registration. FastForward is not affiliated with the US Food and Drug Administration.'

const s = StyleSheet.create({
  page:      { backgroundColor: '#faf8f2', fontFamily: 'Times-Roman' },
  rim1:      { margin: 14, borderWidth: 5, borderColor: NAVY, padding: 4 },
  rim2:      { borderWidth: 1.5, borderColor: GOLD, padding: 3 },
  rim3:      { borderWidth: 0.5, borderColor: GOLD },
  paper:     { backgroundColor: '#ffffff', padding: '18 30 16' },
  emblems:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 },
  eagle:     { width: 82, height: 64 },
  flag:      { width: 56, height: 37 },
  h1:        { fontFamily: 'Times-Bold', fontSize: 16, textAlign: 'center', letterSpacing: 1.5, color: NAVY, marginBottom: 3 },
  h2:        { fontFamily: 'Times-Roman', fontSize: 11, textAlign: 'center', color: '#333', marginBottom: 2 },
  valid:     { fontSize: 11, textAlign: 'center', color: NAVY, marginTop: 5 },
  gold:      { height: 1.5, backgroundColor: GOLD, marginVertical: 8 },
  goldThin:  { height: 0.5, backgroundColor: GOLD, marginVertical: 6 },
  row2:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  italic:    { fontFamily: 'Times-Italic', fontSize: 10.5, color: '#333' },
  bold9:     { fontFamily: 'Times-Bold', fontSize: 9, color: '#555', letterSpacing: 0.5 },
  company:   { fontFamily: 'Times-BoldItalic', fontSize: 13, textAlign: 'center', color: NAVY, marginVertical: 4 },
  para:      { fontFamily: 'Times-Italic', fontSize: 9.5, lineHeight: 1.7, color: '#333', textAlign: 'justify', marginBottom: 9 },
  fRow:      { flexDirection: 'row', marginBottom: 4 },
  fLabel:    { fontFamily: 'Times-BoldItalic', fontSize: 9.5, width: 115, color: NAVY, flexShrink: 0 },
  fVal:      { fontSize: 9.5, flex: 1, color: '#111', fontFamily: 'Times-Roman' },
  tHead:     { flexDirection: 'row', backgroundColor: NAVY, padding: '5 10', marginTop: 8 },
  tHeadTxt:  { color: GOLD, fontSize: 8, letterSpacing: 1, fontFamily: 'Times-Bold' },
  tRow:      { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#eee', padding: '5 10' },
  tRowAlt:   { backgroundColor: '#f9f9f9' },
  tProd:     { flex: 1, fontSize: 9, color: '#111', fontFamily: 'Times-Roman' },
  tId:       { width: 95, fontSize: 8.5, fontFamily: 'Courier', color: '#111' },
  disc:      { fontSize: 6.5, color: '#999', textAlign: 'justify', lineHeight: 1.55, marginTop: 10, fontFamily: 'Times-Italic' },
  footer:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: GOLD },
  fLogo:     { width: 100, height: 30, objectFit: 'contain' },
  fQrWrap:   { alignItems: 'center', gap: 3 },
  fQr:       { width: 62, height: 62 },
  fQrLbl:    { fontSize: 6.5, color: '#aaa', textAlign: 'center', fontFamily: 'Times-Roman' },
  fSig:      { alignItems: 'flex-end' },
  sigRule:   { width: 100, height: 0.8, backgroundColor: '#444', marginBottom: 3 },
  sigName:   { fontFamily: 'Times-Bold', fontSize: 9.5, color: NAVY, textAlign: 'right' },
  sigTitle:  { fontSize: 8, color: '#888', textAlign: 'right', fontFamily: 'Times-Roman' },
  contHdr:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  contEagle: { width: 44, height: 34, opacity: 0.65 },
  pageNum:   { fontSize: 8, color: '#aaa', textAlign: 'right', marginBottom: 4, fontFamily: 'Times-Roman' },
})

async function makeQR(url: string): Promise<string> {
  return QRCode.toDataURL(url, { width: 124, margin: 1, color: { dark: NAVY, light: '#ffffff' } })
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.fRow}>
      <Text style={s.fLabel}>{label}</Text>
      <Text style={s.fVal}>{value}</Text>
    </View>
  )
}

interface PP { cert: Certificate; qr: string; isEs: boolean; products: Certificate['products']; pageNum: number; totalPages: number }

function CertPage({ cert, qr, isEs, products, pageNum, totalPages }: PP) {
  const typeName  = CERT_TYPE_LABELS[cert.type]
  const validDate = new Date(cert.expiry_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const issueDate = new Date(cert.issue_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const prodLabel = PRODUCT_LABEL[cert.type]
  const pageProds = pageNum === 1 ? (products||[]).slice(0,8) : (products||[]).slice(8)
  const hasMore   = pageNum === 1 && (products||[]).length > 8

  return (
    <Page size="LETTER" style={s.page}>
      <View style={s.rim1}><View style={s.rim2}><View style={s.rim3}><View style={s.paper}>

        {totalPages > 1 && <Text style={s.pageNum}>Page {pageNum} of {totalPages}</Text>}

        {pageNum === 1 ? (<>
          <View style={s.emblems}>
            <Image src={FLAG}  style={s.flag} />
            <Image src={EAGLE} style={s.eagle} />
            <Image src={FLAG}  style={s.flag} />
          </View>
          <Text style={s.h1}>Certificate of Registration</Text>
          <Text style={s.h2}>{typeName}</Text>
          <Text style={s.valid}>{isEs?'Válido hasta:':'Valid:'}{' '}<Text style={{fontFamily:'Times-Bold'}}>{validDate}</Text></Text>
        </>) : (
          <View style={s.contHdr}>
            <View>
              <Text style={{fontFamily:'Times-Bold',fontSize:12,color:NAVY}}>Certificate of Registration — Continuation</Text>
              <Text style={{fontSize:9,color:'#555',marginTop:2,fontFamily:'Times-Roman'}}>{typeName} · {cert.company_name}</Text>
              <Text style={{fontSize:9,color:'#888',marginTop:1,fontFamily:'Times-Roman'}}>Reg: {cert.registration_number} · Valid: {validDate} · Issued: {issueDate}</Text>
            </View>
            <Image src={EAGLE} style={s.contEagle} />
          </View>
        )}

        <View style={s.gold} />

        {pageNum === 1 && (<>
          <View style={s.row2}>
            <Text style={s.italic}>{isEs?'Este certificado confirma que:':'This certifies that:'}</Text>
            <Text style={s.bold9}>ISSUED: {issueDate}</Text>
          </View>
          <Text style={s.company}>{cert.company_name}</Text>
          <View style={s.gold} />
          <Text style={s.para}>{isEs
            ? `Está registrado ante la Administración de Alimentos y Medicamentos de los Estados Unidos conforme a la Ley Federal de Alimentos, Medicamentos y Cosméticos, modificada por la Ley contra el Bioterrorismo de 2002 y la Ley de Modernización de la Inocuidad Alimentaria de la FDA, habiéndose verificado dicho registro como actualmente vigente a la fecha por Fast Forward:`
            : `Is registered with the US Food and Drug Administration pursuant to the Federal Food Drug and Cosmetic Act, as amended by the Bioterrorism Act of 2002 and the FDA Food Safety Modernization Act, such registration having been verified as currently effective on the date hereof by Fast Forward:`
          }</Text>
          <Field label={isEs?'Número de Registro:':'Registration Number:'} value={cert.registration_number} />
          <Field label={isEs?'Dirección de Instalación:':'Facility Address:'} value={cert.facility_address} />
          <Field label="DUNS #:" value={cert.duns_number||'N/A'} />
          <Field label={isEs?'Agente en EE.UU.:':'US Agent:'} value="FASTFORWARD TRADING COMPANY, LLC" />
          <Field label="" value="US AGENT ID: USID0408350" />
          <Field label="" value="33 SW 2nd Ave, Ste 702, Miami, Florida, United States" />
        </>)}

        {pageNum === 2 && (
          <Text style={{...s.para,marginBottom:8}}>{isEs
            ? `Productos adicionales registrados — continuación del certificado emitido el ${issueDate}:`
            : `Additional registered products — continuation of certificate issued on ${issueDate}:`
          }</Text>
        )}

        {pageProds && pageProds.length > 0 && HAS_PRODUCTS.includes(cert.type) && (<>
          <View style={s.goldThin} />
          <View style={s.tHead}>
            <Text style={{...s.tHeadTxt,flex:1}}>{isEs?'Producto / Artículo':'Product / Item'}</Text>
            <Text style={{...s.tHeadTxt,width:95}}>{prodLabel}</Text>
          </View>
          {pageProds.map((p,i)=>(
            <View key={p.id} style={[s.tRow,i%2===1?s.tRowAlt:{}]}>
              <Text style={s.tProd}>{p.product_name}</Text>
              <Text style={s.tId}>{p.product_id}</Text>
            </View>
          ))}
          {hasMore && <Text style={{fontSize:8,color:NAVY,fontFamily:'Times-Italic',marginTop:4}}>{isEs?'→ Continúa en la página 2':'→ Continued on page 2'}</Text>}
        </>)}

        <Text style={s.disc}>{DISC}</Text>

        <View style={s.footer}>
          <Image src={LOGO} style={s.fLogo} />
          <View style={s.fQrWrap}>
            <Image src={qr} style={s.fQr} />
            <Text style={s.fQrLbl}>{isEs?'Escanear para validar':'Scan to validate'}</Text>
          </View>
          <View style={s.fSig}>
            <View style={{width:100,height:22,marginBottom:2}} />
            <View style={s.sigRule} />
            <Text style={s.sigName}>Carlos Bisio</Text>
            <Text style={s.sigTitle}>CEO, FastForward Trading Company</Text>
          </View>
        </View>

      </View></View></View></View>
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
