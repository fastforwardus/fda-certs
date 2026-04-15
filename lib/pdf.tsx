import React from 'react'
import {
  Document, Page, View, Text, Image, StyleSheet, Font,
} from '@react-pdf/renderer'
import { Certificate, CERT_TYPE_LABELS, PRODUCT_LABEL, HAS_PRODUCTS } from '@/types'
import QRCode from 'qrcode'

Font.register({
  family: 'Times',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/timesnewroman/v1/times.ttf' },
  ],
})

const EAGLE_URL = 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Coat_of_arms_of_the_United_States.svg'
const FLAG_URL = 'https://flagcdn.com/w160/us.png'
const LOGO_URL = 'https://fastfwdus.com/wp-content/uploads/2026/04/FF_Logo_01-2.png'

const DISC_EN = 'This certificate affirms that the above stated facility is registered with the US Food and Drug Administration pursuant to the Federal Food Drug and Cosmetic Act, as amended by the Bioterrorism Act of 2002 and the FDA Food Safety Modernization Act, such registration remains effective upon request and presentation of this certificate until 1 year after issuance date, unless such registration has been terminated after issuance of this certificate. FastForward makes no other representations or warranties. The US Food and Drug Administration does not issue a certificate of registration, nor does the US Food and Drug Administration recognize a certificate of registration. FastForward is not affiliated with the US Food and Drug Administration.'

const DISC_ES = 'Este certificado confirma que la instalación mencionada está registrada ante la Administración de Alimentos y Medicamentos de los Estados Unidos conforme a la Ley Federal de Alimentos, Medicamentos y Cosméticos, modificada por la Ley contra el Bioterrorismo de 2002 y la Ley de Modernización de la Inocuidad Alimentaria de la FDA. FastForward no asume ninguna representación adicional ni garantía. La FDA de EE.UU. no emite certificados de registro ni reconoce dichos certificados. FastForward no está afiliada a la FDA de EE.UU.'

const AGENT_EN = '33 SW 2nd Ave, Ste 702, Miami, Florida, United States'
const AGENT_ES = '33 SW 2nd Ave, Ste 702, Miami, Florida, Estados Unidos'

const styles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', fontFamily: 'Times-Roman', fontSize: 10 },
  outerBorder: { margin: 12, borderWidth: 5, borderColor: '#5a6a88', padding: 3 },
  midBorder: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', padding: 2 },
  innerBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: '#ffffff' },
  paper: { padding: '16 28 14', backgroundColor: '#ffffff' },

  emblemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, gap: 8 },
  eagleImg: { height: 90, width: 78 },
  flagImg: { width: 52, height: 34 },

  h1: { fontFamily: 'Times-Bold', fontSize: 14, textAlign: 'center', letterSpacing: 1.5, marginBottom: 2, color: '#111' },
  h2: { fontFamily: 'Times-Bold', fontSize: 11, textAlign: 'center', marginBottom: 2, color: '#111' },
  validLine: { fontSize: 10, textAlign: 'center', marginTop: 4, marginBottom: 2, color: '#111' },

  divider: { height: 1, backgroundColor: '#555', marginVertical: 7 },

  certifyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  certifyText: { fontFamily: 'Times-Italic', fontSize: 10, color: '#111' },
  issuedText: { fontSize: 9, fontFamily: 'Times-Bold', color: '#333', letterSpacing: 0.3 },
  companyName: { fontFamily: 'Times-BoldItalic', fontSize: 12, textAlign: 'center', marginVertical: 3, color: '#111' },
  para: { fontFamily: 'Times-Italic', fontSize: 9, lineHeight: 1.7, marginBottom: 8, color: '#222', textAlign: 'justify' },

  fieldRow: { flexDirection: 'row', marginBottom: 3 },
  fieldLabel: { fontFamily: 'Times-BoldItalic', fontSize: 9, width: 110, color: '#111', flexShrink: 0 },
  fieldValue: { fontSize: 9, flex: 1, color: '#111' },

  tableHeader: { flexDirection: 'row', backgroundColor: '#1a3a5c', padding: '5 8', marginTop: 8 },
  tableHeaderText: { color: '#c9a84c', fontSize: 8, letterSpacing: 0.8, fontFamily: 'Times-Bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#eee', padding: '5 8' },
  tableRowAlt: { backgroundColor: '#f9f9f9' },
  tableCellProduct: { flex: 1, fontSize: 9, color: '#111' },
  tableCellId: { width: 90, fontSize: 8, fontFamily: 'Courier', color: '#111', fontWeight: 700 },

  disclaimer: { fontSize: 6.5, color: '#888', textAlign: 'justify', lineHeight: 1.5, marginTop: 8, fontFamily: 'Times-Italic' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#444' },
  footerLogo: { width: 90, height: 28, objectFit: 'contain' },
  footerQrWrap: { alignItems: 'center', gap: 2 },
  footerQr: { width: 56, height: 56 },
  footerQrLabel: { fontSize: 6.5, color: '#888', textAlign: 'center' },
  footerSig: { alignItems: 'flex-end' },
  sigLine: { width: 80, height: 1, backgroundColor: '#111', marginBottom: 3 },
  sigName: { fontFamily: 'Times-Bold', fontSize: 9, color: '#111', textAlign: 'right' },
  sigTitle: { fontSize: 8, color: '#666', textAlign: 'right' },

  pageLabel: { fontSize: 8, color: '#888', textAlign: 'right', marginBottom: 4 },
  continuationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#999' },
  continuationEagle: { width: 40, height: 32, opacity: 0.7 },
})

async function makeQR(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 112,
    margin: 1,
    color: { dark: '#1a3a5c', light: '#ffffff' },
  })
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  )
}

interface CertPageProps {
  cert: Certificate
  qrDataUrl: string
  isEs: boolean
  products: Certificate['products']
  pageNum: number
  totalPages: number
  appUrl: string
}

function CertificatePage({ cert, qrDataUrl, isEs, products, pageNum, totalPages, appUrl }: CertPageProps) {
  const typeName = CERT_TYPE_LABELS[cert.type]
  const validDate = new Date(cert.expiry_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const issueDate = new Date(cert.issue_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const productLabel = PRODUCT_LABEL[cert.type]
  const disc = isEs ? DISC_ES : DISC_EN
  const agentAddr = isEs ? AGENT_ES : AGENT_EN

  const pageProducts = pageNum === 1
    ? (products || []).slice(0, 8)
    : (products || []).slice(8)

  const hasMorePages = pageNum === 1 && (products || []).length > 8

  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.outerBorder}>
        <View style={styles.midBorder}>
          <View style={styles.innerBorder}>
            <View style={styles.paper}>
              {totalPages > 1 && (
                <Text style={styles.pageLabel}>Page {pageNum} of {totalPages}</Text>
              )}

              {pageNum === 1 ? (
                <>
                  <View style={styles.emblemRow}>
                    <Image src={FLAG_URL} style={{ ...styles.flagImg, transform: 'rotate(-7deg)' }} />
                    <Image src={EAGLE_URL} style={styles.eagleImg} />
                    <Image src={FLAG_URL} style={{ ...styles.flagImg, transform: 'rotate(7deg)' }} />
                  </View>
                  <Text style={styles.h1}>Certificate of Registration</Text>
                  <Text style={styles.h2}>{typeName}</Text>
                  <Text style={styles.validLine}>{isEs ? 'Válido hasta:' : 'Valid:'} {'   '} <Text style={{ fontFamily: 'Times-Bold' }}>{validDate}</Text></Text>
                </>
              ) : (
                <View style={styles.continuationHeader}>
                  <View>
                    <Text style={{ fontFamily: 'Times-Bold', fontSize: 12, color: '#1a3a5c' }}>Certificate of Registration — Continuation</Text>
                    <Text style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{typeName} · {cert.company_name}</Text>
                    <Text style={{ fontSize: 9, color: '#777', marginTop: 1 }}>Reg: {cert.registration_number} · Valid: {validDate} · Issued: {issueDate}</Text>
                  </View>
                  <Image src={EAGLE_URL} style={styles.continuationEagle} />
                </View>
              )}

              <View style={styles.divider} />

              {pageNum === 1 && (
                <>
                  <View style={styles.certifyRow}>
                    <Text style={styles.certifyText}>{isEs ? 'Este certificado confirma que:' : 'This certifies that:'}</Text>
                    <Text style={styles.issuedText}>ISSUED: {issueDate}</Text>
                  </View>
                  <Text style={styles.companyName}>{cert.company_name}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.para}>
                    {isEs
                      ? `Está registrado ante la Administración de Alimentos y Medicamentos de los Estados Unidos conforme a la Ley Federal de Alimentos, Medicamentos y Cosméticos, modificada por la Ley contra el Bioterrorismo de 2002 y la Ley de Modernización de la Inocuidad Alimentaria de la FDA, habiéndose verificado dicho registro como actualmente vigente a la fecha por Fast Forward:`
                      : `Is registered with the US Food and Drug Administration pursuant to the Federal Food Drug and Cosmetic Act, as amended by the Bioterrorism Act of 2002 and the FDA Food Safety Modernization Act, such registration having been verified as currently effective on the date hereof by Fast Forward:`}
                  </Text>
                  <Field label={isEs ? 'Número de Registro:' : 'Registration Number:'} value={cert.registration_number} />
                  <Field label={isEs ? 'Dirección de Instalación:' : 'Facility Address:'} value={cert.facility_address} />
                  <Field label="DUNS #:" value={cert.duns_number || 'N/A'} />
                  <Field label={isEs ? 'Agente en EE.UU.:' : 'US Agent:'} value="FASTFORWARD TRADING COMPANY, LLC" />
                  <Field label="" value="US AGENT ID: USID0408350" />
                  <Field label="" value={agentAddr} />
                </>
              )}

              {pageNum === 2 && (
                <Text style={{ ...styles.para, marginBottom: 8 }}>
                  {isEs
                    ? `Productos adicionales registrados — continuación del certificado emitido el ${issueDate}:`
                    : `Additional registered products — continuation of certificate issued on ${issueDate}:`}
                </Text>
              )}

              {pageProducts && pageProducts.length > 0 && HAS_PRODUCTS.includes(cert.type) && (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={{ ...styles.tableHeaderText, flex: 1 }}>{isEs ? 'Producto / Artículo' : 'Product / Item'}</Text>
                    <Text style={{ ...styles.tableHeaderText, width: 90 }}>{productLabel}</Text>
                  </View>
                  {pageProducts.map((p, i) => (
                    <View key={p.id} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                      <Text style={styles.tableCellProduct}>{p.product_name}</Text>
                      <Text style={styles.tableCellId}>{p.product_id}</Text>
                    </View>
                  ))}
                  {hasMorePages && (
                    <Text style={{ fontSize: 8, color: '#1a3a5c', fontFamily: 'Times-Italic', marginTop: 4 }}>
                      {isEs ? '→ Continúa en la página 2' : '→ Continued on page 2'}
                    </Text>
                  )}
                </>
              )}

              <Text style={styles.disclaimer}>{disc}</Text>

              <View style={styles.footer}>
                <Image src={LOGO_URL} style={styles.footerLogo} />
                <View style={styles.footerQrWrap}>
                  <Image src={qrDataUrl} style={styles.footerQr} />
                  <Text style={styles.footerQrLabel}>{isEs ? 'Escanear para validar' : 'Scan to validate'}</Text>
                </View>
                <View style={styles.footerSig}>
                  <View style={{ width: 80, height: 20, marginBottom: 2 }} />
                  <View style={styles.sigLine} />
                  <Text style={styles.sigName}>Carlos Bisio</Text>
                  <Text style={styles.sigTitle}>CEO</Text>
                </View>
              </View>

            </View>
          </View>
        </View>
      </View>
    </Page>
  )
}

export async function generateCertificatePDF(
  cert: Certificate,
  appUrl: string
): Promise<Buffer> {
  const { renderToBuffer } = await import('@react-pdf/renderer')

  const validationUrl = `${appUrl}/validate?credential=${cert.validation_id}`
  const qrDataUrl = await makeQR(validationUrl)
  const isEs = cert.language === 'es'
  const products = cert.products || []
  const totalPages = products.length > 8 ? 2 : 1

  const doc = React.createElement(
    Document,
    { title: `FDA Certificate — ${cert.company_name}`, author: 'FastForward Trading Company' },
    React.createElement(CertificatePage, {
      cert, qrDataUrl, isEs, products, pageNum: 1, totalPages, appUrl,
    }),
    ...(totalPages === 2
      ? [React.createElement(CertificatePage, {
          cert, qrDataUrl, isEs, products, pageNum: 2, totalPages, appUrl,
        })]
      : [])
  )

  const buffer = await renderToBuffer(doc)
  return Buffer.from(buffer)
}
