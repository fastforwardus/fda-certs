import { Resend } from 'resend'
import { Certificate, CERT_TYPE_LABELS } from '@/types'

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is required')
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = 'FastForward Compliance <info@fastfwdus.com>'

export async function sendCertificateEmail({
  to, certificate, pdfBuffer, language = 'en',
}: {
  to: string
  certificate: Certificate
  pdfBuffer: Buffer
  language?: 'en' | 'es'
}) {
  const isEs = language === 'es'
  const typeName = CERT_TYPE_LABELS[certificate.type]
  const companyName = certificate.company_name
  const validThru = new Date(certificate.expiry_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const subject = isEs
    ? `Su Certificado FDA está listo — ${companyName}`
    : `Your FDA Certificate is ready — ${companyName}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fastfwdus.com'
  const validationUrl = `${appUrl}/validate?credential=${certificate.validation_id}`
  const logoUrl = 'https://fastfwdus.com/wp-content/uploads/2025/04/logorwhitehorizontal.png'

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden">
  <tr><td style="background:#1a3a5c;padding:20px 32px">
    <table width="100%"><tr>
      <td><img src="${logoUrl}" height="34" alt="FastForward" style="display:block"></td>
      <td align="right" style="color:#c9a84c;font-size:10px;letter-spacing:1px;text-transform:uppercase;line-height:1.8">FDA Registration<br>Services</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:32px 36px">
    <h1 style="font-family:Georgia,serif;font-size:22px;color:#1a3a5c;margin:0 0 12px">${isEs ? 'Su Certificado FDA Está Listo' : 'Your FDA Certificate Is Ready'}</h1>
    <p style="font-size:14px;color:#444;line-height:1.8;margin:0 0 20px">${isEs ? `Estimado/a cliente,<br><br>Nos complace confirmar que el certificado FDA para <strong>${companyName}</strong> ha sido generado exitosamente.` : `Dear valued client,<br><br>We are pleased to confirm that the FDA Certificate for <strong>${companyName}</strong> has been successfully generated.`}</p>
    <div style="border:1.5px solid #c9a84c;border-radius:8px;background:#fdfaf3;padding:16px 20px;margin-bottom:20px">
      <p style="font-family:Georgia,serif;font-size:15px;font-weight:700;color:#1a3a5c;margin:0 0 4px">${typeName}</p>
      <p style="font-size:12px;color:#666;margin:0 0 2px">${companyName}</p>
      <p style="font-size:12px;color:#666;margin:0 0 2px">${isEs ? 'Registro #' : 'Registration #'}: ${certificate.registration_number}</p>
      <p style="font-size:12px;color:#666;margin:0 0 8px">${isEs ? 'Válido hasta' : 'Valid through'}: <strong style="color:#1a3a5c">${validThru}</strong></p>
      <span style="display:inline-block;background:#e8f5e9;color:#2e7d32;font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px">${isEs ? 'ACTIVO Y VIGENTE' : 'ACTIVE & VALID'}</span>
    </div>
    <p style="font-size:13px;color:#444;margin:0 0 20px">${isEs ? 'Valide su certificado en:' : 'Validate your certificate at:'}<br>
    <a href="${validationUrl}" style="color:#1a3a5c;font-weight:700">${validationUrl}</a></p>
    <hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0">
    <p style="font-size:14px;color:#333;line-height:1.8;margin:0">${isEs ? 'Atentamente,' : 'Best regards,'}<br>
    <strong style="font-family:Georgia,serif;font-size:15px;color:#1a3a5c">${isEs ? 'El Equipo de Cumplimiento FastForward' : 'The FastForward Compliance Team'}</strong></p>
  </td></tr>
  <tr><td style="background:#f5f5f5;padding:18px 36px;text-align:center;border-top:1px solid #e8e8e8">
    <p style="font-size:11px;color:#aaa;margin:0">FastForward Trading Company, LLC · 33 SW 2nd Ave, Ste 702, Miami, Florida, United States</p>
    <p style="font-size:10px;color:#ccc;margin:4px 0 0">&copy; ${new Date().getFullYear()} FastForward Trading Company, LLC. All rights reserved.</p>
  </td></tr>
</table></td></tr></table></body></html>`

  const resend = getResend()
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    attachments: [{
      filename: `FDA_Certificate_${certificate.cert_number}.pdf`,
      content: pdfBuffer,
    }],
  })
  if (error) throw new Error(error.message)
  return data
}
