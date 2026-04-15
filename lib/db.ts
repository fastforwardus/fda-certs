import { neon, NeonQueryFunction } from '@neondatabase/serverless'
import { Certificate, User } from '@/types'

let _sql: NeonQueryFunction<false, false> | null = null

function getSQL(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
    _sql = neon(process.env.DATABASE_URL)
  }
  return _sql
}

// Proxy so `sql` tag template works everywhere
export const sql: NeonQueryFunction<false, false> = new Proxy(
  ((() => {}) as unknown as NeonQueryFunction<false, false>),
  {
    apply(_t, _this, args) {
      return (getSQL() as unknown as Function)(...args)
    },
    get(_t, prop) {
      return getSQL()[prop as keyof NeonQueryFunction<false, false>]
    },
  }
)

export async function getUser(id: string): Promise<User | null> {
  const rows = await getSQL()`SELECT id, name, email, role, created_at FROM users WHERE id = ${id}`
  return (rows[0] as User) || null
}

export async function getUserByEmail(email: string) {
  const rows = await getSQL()`SELECT * FROM users WHERE email = ${email}`
  return rows[0] || null
}

export async function getAllUsers(): Promise<User[]> {
  const rows = await getSQL()`SELECT id, name, email, role, created_at FROM users ORDER BY created_at ASC`
  return rows as User[]
}

export async function getCertificates(userId?: string, isAdmin?: boolean): Promise<Certificate[]> {
  const db = getSQL()
  if (isAdmin) {
    const rows = await db`
      SELECT c.*, u.name as created_by_name
      FROM certificates c
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.created_at DESC`
    return rows as Certificate[]
  }
  const rows = await db`
    SELECT c.*, u.name as created_by_name
    FROM certificates c
    LEFT JOIN users u ON c.created_by = u.id
    WHERE c.created_by = ${userId}
    ORDER BY c.created_at DESC`
  return rows as Certificate[]
}

export async function getCertificateById(id: string): Promise<Certificate | null> {
  const db = getSQL()
  const rows = await db`
    SELECT c.*, u.name as created_by_name
    FROM certificates c
    LEFT JOIN users u ON c.created_by = u.id
    WHERE c.id = ${id}`
  if (!rows[0]) return null
  const products = await db`
    SELECT * FROM certificate_products
    WHERE certificate_id = ${id}
    ORDER BY sort_order ASC`
  return { ...rows[0], products } as Certificate
}

export async function getCertificateByValidationId(validationId: string): Promise<Certificate | null> {
  const db = getSQL()
  const rows = await db`
    SELECT c.*, u.name as created_by_name
    FROM certificates c
    LEFT JOIN users u ON c.created_by = u.id
    WHERE c.validation_id = ${validationId}`
  if (!rows[0]) return null
  const products = await db`
    SELECT * FROM certificate_products
    WHERE certificate_id = ${rows[0].id}
    ORDER BY sort_order ASC`
  return { ...rows[0], products } as Certificate
}

export async function getNextCertNumber(): Promise<string> {
  const db = getSQL()
  const year = new Date().getFullYear()
  const rows = await db`
    SELECT cert_number FROM certificates
    WHERE cert_number LIKE ${'FF-' + year + '-%'}
    ORDER BY cert_number DESC LIMIT 1`
  if (!rows[0]) return `FF-${year}-001`
  const last = parseInt(rows[0].cert_number.split('-')[2]) || 0
  return `FF-${year}-${String(last + 1).padStart(3, '0')}`
}

export async function getMetrics() {
  const db = getSQL()
  const [total, active, expiring, thisMonth] = await Promise.all([
    db`SELECT COUNT(*) as count FROM certificates`,
    db`SELECT COUNT(*) as count FROM certificates WHERE status = 'active'`,
    db`SELECT COUNT(*) as count FROM certificates WHERE status = 'expiring'`,
    db`SELECT COUNT(*) as count FROM certificates WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
  ])
  return {
    total: parseInt(total[0].count as string),
    active: parseInt(active[0].count as string),
    expiring: parseInt(expiring[0].count as string),
    thisMonth: parseInt(thisMonth[0].count as string),
  }
}

export async function getMonthlyStats(): Promise<{ month: string; count: string }[]> {
  const rows = await getSQL()`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
      COUNT(*) as count
    FROM certificates
    WHERE created_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at) ASC`
  return rows as { month: string; count: string }[]
}

export async function getUserStats(userId: string) {
  const db = getSQL()
  const [total, active, expiring] = await Promise.all([
    db`SELECT COUNT(*) as count FROM certificates WHERE created_by = ${userId}`,
    db`SELECT COUNT(*) as count FROM certificates WHERE created_by = ${userId} AND status = 'active'`,
    db`SELECT COUNT(*) as count FROM certificates WHERE created_by = ${userId} AND status = 'expiring'`,
  ])
  return {
    total: parseInt(total[0].count as string),
    active: parseInt(active[0].count as string),
    expiring: parseInt(expiring[0].count as string),
  }
}
