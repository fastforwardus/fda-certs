import { getCertificateByValidationId } from '@/lib/db'
import { CERT_TYPE_LABELS } from '@/types'

interface Props { searchParams: Promise<{ credential?: string }> }

export default async function ValidatePage({ searchParams }: Props) {
  const { credential } = await searchParams
  let cert = null
  let isValid = false
  if (credential) {
    cert = await getCertificateByValidationId(credential)
    if (cert) isValid = new Date(cert.expiry_date) >= new Date()
  }

  return (
    <div style={{minHeight:'100vh',background:'#1a3a5c',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{width:'100%',maxWidth:440}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <img src="https://fastfwdus.com/wp-content/uploads/2025/04/logorwhitehorizontal.png" alt="FastForward" style={{height:36,objectFit:'contain'}} />
          <p style={{color:'rgba(255,255,255,0.4)',fontSize:10,letterSpacing:3,textTransform:'uppercase',marginTop:8}}>Certificate Validator</p>
        </div>
        <div style={{background:'white',borderRadius:16,overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
          {!credential ? (
            <div style={{padding:40,textAlign:'center',color:'#9ca3af',fontSize:14}}>
              Scan the QR code on your certificate to validate it.
            </div>
          ) : !cert ? (
            <div style={{padding:40,textAlign:'center'}}>
              <div style={{width:56,height:56,background:'#fef2f2',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:24}}>✗</div>
              <p style={{fontSize:16,fontWeight:600,color:'#111',margin:'0 0 4px'}}>Certificate not found</p>
              <p style={{fontSize:13,color:'#9ca3af',margin:0}}>This credential is not in our system.</p>
            </div>
          ) : (
            <>
              <div style={{background:isValid?'#16a34a':'#dc2626',padding:'24px 24px 20px',textAlign:'center'}}>
                <div style={{width:52,height:52,background:'white',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:22,color:isValid?'#16a34a':'#dc2626'}}>
                  {isValid?'✓':'✗'}
                </div>
                <p style={{color:'white',fontWeight:700,fontSize:18,margin:'0 0 4px'}}>
                  {isValid?'Certificate Valid':'Certificate Expired'}
                </p>
              </div>
              <div style={{padding:24}}>
                {[
                  ['Certificate #', cert.cert_number],
                  ['Type', CERT_TYPE_LABELS[cert.type as keyof typeof CERT_TYPE_LABELS]],
                  ['Registered entity', cert.company_name],
                  ['Registration #', cert.registration_number],
                  ['Issued', new Date(cert.issue_date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})],
                  ['Valid through', new Date(cert.expiry_date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})],
                  ['Issued by', 'FastForward Trading Company, LLC'],
                ].map(([label,value])=>(
                  <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'8px 0',borderBottom:'1px solid #f3f4f6'}}>
                    <span style={{fontSize:12,color:'#9ca3af'}}>{label}</span>
                    <span style={{fontSize:13,color:'#111',textAlign:'right',maxWidth:240}}>{value}</span>
                  </div>
                ))}
                <p style={{fontSize:11,color:'#d1d5db',textAlign:'center',marginTop:16}}>
                  Validated on {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}
                </p>
              </div>
            </>
          )}
        </div>
        <p style={{textAlign:'center',color:'rgba(255,255,255,0.2)',fontSize:11,marginTop:20}}>
          © {new Date().getFullYear()} FastForward Trading Company, LLC
        </p>
      </div>
    </div>
  )
}
