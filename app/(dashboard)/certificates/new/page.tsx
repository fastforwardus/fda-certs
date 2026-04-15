'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CertType, CERT_TYPE_LABELS, CERT_TYPE_DISPLAY, HAS_PRODUCTS, PRODUCT_LABEL } from '@/types'

const TYPES: CertType[] = ['food_initial', 'food_renewal', 'food_low_acid', 'mocra', 'drug']

interface Product { product_name: string; product_id: string }

export default function NewCertificatePage() {
  const router = useRouter()
  const [type, setType] = useState<CertType | null>(null)
  const [lang, setLang] = useState<'en' | 'es'>('en')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmail, setShowEmail] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')

  const [form, setForm] = useState({
    company_name: '',
    registration_number: '',
    duns_number: '',
    facility_address: '',
    expiry_date: `${new Date().getFullYear()}-12-31`,
  })

  const [products, setProducts] = useState<Product[]>([{ product_name: '', product_id: '' }])

  function updateForm(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function addProduct() { setProducts(prev => [...prev, { product_name: '', product_id: '' }]) }
  function removeProduct(i: number) { setProducts(prev => prev.filter((_, idx) => idx !== i)) }
  function updateProduct(i: number, field: keyof Product, value: string) {
    setProducts(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  const hasProducts = type && HAS_PRODUCTS.includes(type)
  const productLabel = type ? PRODUCT_LABEL[type] : 'ID #'
  const willBe2Pages = hasProducts && products.filter(p => p.product_name).length > 8

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type) { setError('Please select a certificate type'); return }
    setError('')
    setLoading(true)

    try {
      const payload = {
        type,
        ...form,
        language: lang,
        products: hasProducts ? products.filter(p => p.product_name && p.product_id) : undefined,
        send_email: showEmail && !!recipientEmail,
        recipient_email: showEmail ? recipientEmail : undefined,
      }

      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create certificate'); return }

      router.push(`/certificates/${data.id}`)
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">New Certificate</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the details to generate a new FDA certificate</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Type selection */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Certificate type</p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  type === t
                    ? 'bg-[#1a3a5c] text-[#c9a84c] border-[#1a3a5c] font-medium'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {CERT_TYPE_DISPLAY[t]}
              </button>
            ))}
          </div>
          {type && (
            <p className="text-xs text-gray-400 mt-2">{CERT_TYPE_LABELS[type]}</p>
          )}
        </div>

        {type && (
          <>
            {/* Core fields */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <p className="text-sm font-medium text-gray-700">Facility information</p>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Company / Facility name *</label>
                <input
                  required
                  value={form.company_name}
                  onChange={e => updateForm('company_name', e.target.value)}
                  placeholder="Laboratorios XYZ S.A. de C.V."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Registration number *</label>
                  <input
                    required
                    value={form.registration_number}
                    onChange={e => updateForm('registration_number', e.target.value)}
                    placeholder="12042246678"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">DUNS #</label>
                  <input
                    value={form.duns_number}
                    onChange={e => updateForm('duns_number', e.target.value)}
                    placeholder="810007732 or N/A"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Facility address *</label>
                <input
                  required
                  value={form.facility_address}
                  onChange={e => updateForm('facility_address', e.target.value)}
                  placeholder="Street No. 123, Industrial Park, City, Country"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Expiry date *</label>
                <input
                  required
                  type="date"
                  value={form.expiry_date}
                  onChange={e => updateForm('expiry_date', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                />
              </div>
            </div>

            {/* Products (if applicable) */}
            {hasProducts && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">Products <span className="text-gray-400 font-normal">({productLabel})</span></p>
                  {willBe2Pages && (
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg font-medium">
                      → Will generate 2-page PDF
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  {products.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={p.product_name}
                        onChange={e => updateProduct(i, 'product_name', e.target.value)}
                        placeholder={`Product name ${i + 1}`}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                      />
                      <input
                        value={p.product_id}
                        onChange={e => updateProduct(i, 'product_id', e.target.value)}
                        placeholder={productLabel}
                        className="w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                      />
                      <button
                        type="button"
                        onClick={() => removeProduct(i)}
                        disabled={products.length === 1}
                        className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors disabled:opacity-30 flex items-center justify-center text-lg flex-shrink-0"
                      >
                        −
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addProduct}
                  className="text-sm text-[#1a3a5c] hover:underline"
                >
                  + Add product
                </button>

                <p className="text-xs text-gray-400 mt-2">
                  {products.filter(p => p.product_name).length} product(s) — certificates with more than 8 products automatically generate a 2-page PDF
                </p>
              </div>
            )}

            {/* Language + Email */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Certificate language</p>
                <div className="flex gap-2">
                  {(['en', 'es'] as const).map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                        lang === l ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {l === 'en' ? 'English' : 'Español'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="send-email"
                    checked={showEmail}
                    onChange={e => setShowEmail(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="send-email" className="text-sm text-gray-700">Send certificate by email</label>
                </div>
                {showEmail && (
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    placeholder="recipient@company.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                  />
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating…
                  </>
                ) : (
                  'Generate Certificate'
                )}
              </button>
              <button type="button" onClick={() => router.back()} className="btn-secondary">
                Cancel
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
