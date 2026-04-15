import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers, getUserStats } from '@/lib/db'
import { User } from '@/types'

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await getAllUsers()
  const usersWithStats = await Promise.all(
    users.map(async (u: User) => ({
      ...u,
      stats: await getUserStats(u.id),
    }))
  )
  return NextResponse.json(usersWithStats)
}
