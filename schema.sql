-- FastForward FDA Certificates — Run this in Neon SQL Editor
-- neon.tech → your project → SQL Editor → paste all and Run

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CERTIFICATES
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('food_initial','food_renewal','food_low_acid','mocra','drug')),
  company_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100) NOT NULL,
  duns_number VARCHAR(50) DEFAULT 'N/A',
  facility_address TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  language VARCHAR(5) DEFAULT 'en' CHECK (language IN ('en','es')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','expiring','expired')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  validation_id UUID DEFAULT gen_random_uuid(),
  pages INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS certificate_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Auto status based on expiry
CREATE OR REPLACE FUNCTION update_cert_status() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date < CURRENT_DATE THEN
    NEW.status = 'expired';
  ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    NEW.status = 'expiring';
  ELSE
    NEW.status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cert_status_update ON certificates;
CREATE TRIGGER cert_status_update
  BEFORE INSERT OR UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_cert_status();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_certs_created_by ON certificates(created_by);
CREATE INDEX IF NOT EXISTS idx_certs_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certs_type ON certificates(type);
CREATE INDEX IF NOT EXISTS idx_prods_cert_id ON certificate_products(certificate_id);

-- ─── SEED USERS ───────────────────────────────────────────────────────────────
-- Passwords:
--   Admin:     FF$Admin2026!
--   Tomas:     FF$Tomas2026!
--   Francisco: FF$Francisco2026!

INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin FastForward', 'info@fastfwdus.com',    '$2b$12$wy6EPJwl9rb3bN5Q2CITXuk7xR8wFb3Wo34.wkKFa29.VgZYoJhrm', 'admin'),
  ('Tomas Marino',      'tmarino@fastfwdus.com', '$2b$12$x87BrOJFvZeFzmB3bkdZJ.4l8iVTL7qi2s17eCQjS5j20BUZ7oE76', 'user'),
  ('Francisco Logarzo', 'flogarzo@fastfwdus.com','$2b$12$VoloevctLKlyZ5EtNyRc0Onicz/wYz6inmMLspUH9z3/24USfAz6u', 'user')
ON CONFLICT (email) DO NOTHING;
