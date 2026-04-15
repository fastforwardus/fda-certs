import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'#f5f7fa'}}>
      <Sidebar role={session.role} />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <TopBar user={{ name: session.name, email: session.email, role: session.role }} />
        <main style={{flex:1,overflowY:'auto',padding:24}}>
          {children}
        </main>
      </div>
    </div>
  )
}
