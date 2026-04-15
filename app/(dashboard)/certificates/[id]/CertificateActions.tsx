'use client'
import { useState } from 'react'

export default function CertificateActions({
  certId, certNumber, language,
}: {
  certId: string
  certNumber: string
  language: string
}) {
  const [emailModal, setEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [langOverride, setLangOverride] = useState(language)

  async function sendEmail() {
    if (!email) return
    setSending(true)
    try {
      await fetch(`/api/certificates/${certId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language: langOverride }),
      })
      setSent(true)
      setTimeout(() => { setEmailModal(false); setSent(false); setEmail('') }, 2000)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-5">
        <a
          href={`/api/certificates/${certId}/pdf`}
          download={`FDA_Certificate_${certNumber}.pdf`}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </a>
        <button
          onClick={() => setEmailModal(true)}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Send by email
        </button>
      </div>

      {/* Email modal */}
      {emailModal && (
        <div
          style={{ minHeight: 300, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className="fixed inset-0 z-50"
          onClick={e => { if (e.target === e.currentTarget) setEmailModal(false) }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Send certificate by email</h3>
            <p className="text-sm text-gray-500 mb-4">The PDF will be attached automatically</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Recipient email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email language</label>
                <div className="flex gap-2">
                  {(['en', 'es'] as const).map(l => (
                    <button key={l} type="button" onClick={() => setLangOverride(l)}
                      className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${langOverride === l ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]' : 'border-gray-200 text-gray-600'}`}>
                      {l === 'en' ? 'English' : 'Español'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {sent && (
              <div className="mt-3 bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg border border-green-100">
                Email sent successfully!
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={sendEmail}
                disabled={!email || sending}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
              <button onClick={() => setEmailModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
