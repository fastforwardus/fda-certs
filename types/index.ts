export type Role = 'admin' | 'user'

export type CertType =
  | 'food_initial'
  | 'food_renewal'
  | 'food_low_acid'
  | 'mocra'
  | 'drug'
  | 'medical_device'

export type CertStatus = 'active' | 'expiring' | 'expired'

export type Language = 'en' | 'es'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  created_at: string
}

export interface Product {
  id: string
  certificate_id: string
  product_name: string
  product_id: string
  sort_order: number
}

export interface Certificate {
  id: string
  cert_number: string
  type: CertType
  company_name: string
  registration_number: string
  duns_number: string
  facility_address: string
  issue_date: string
  expiry_date: string
  language: Language
  status: CertStatus
  created_by: string
  created_by_name?: string
  validation_id: string
  pages: number
  created_at: string
  products?: Product[]
}

export interface CreateCertPayload {
  type: CertType
  company_name: string
  registration_number: string
  duns_number: string
  facility_address: string
  expiry_date: string
  language: Language
  products?: { product_name: string; product_id: string }[]
  send_email?: boolean
  recipient_email?: string
}

export const CERT_TYPE_LABELS: Record<CertType, string> = {
  food_initial: 'Food Facility Registration',
  food_renewal: 'Food Facility Registration (Renewal)',
  food_low_acid: 'Low-Acid / Acidified Foods',
  mocra: 'Cosmetic Facility Registration & Product Listing',
  drug: 'Drug Establishment Registration & Product Listing',
  medical_device: 'Medical Device Establishment Registration & Listing',
}

export const CERT_TYPE_DISPLAY: Record<CertType, string> = {
  food_initial: 'Food Initial',
  food_renewal: 'Food Renewal',
  food_low_acid: 'Food Low Acid',
  mocra: 'MoCRA',
  drug: 'Drug',
  medical_device: 'Medical Device',
}

export const PRODUCT_LABEL: Record<CertType, string> = {
  food_initial: '',
  food_renewal: '',
  food_low_acid: 'SID #',
  mocra: 'CPLN #',
  drug: 'NDC #',
  medical_device: 'Reg. #',
}

export const HAS_PRODUCTS: CertType[] = ['food_low_acid', 'mocra', 'drug', 'medical_device']
