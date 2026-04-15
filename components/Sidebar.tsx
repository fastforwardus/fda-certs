'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const adminNav = [
  { href: '/', label: 'Overview', icon: 'grid' },
  { href: '/certificates', label: 'All Certificates', icon: 'doc' },
  { href: '/users', label: 'Users', icon: 'users' },
]
const userNav = [
  { href: '/', label: 'Dashboard', icon: 'grid' },
  { href: '/certificates/new', label: 'New Certificate', icon: 'plus' },
  { href: '/certificates', label: 'My Certificates', icon: 'doc' },
]

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const nav = role === 'admin' ? adminNav : userNav

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{width:224,background:'#1a3a5c',display:'flex',flexDirection:'column',flexShrink:0,height:'100vh'}}>
      <div style={{padding:'20px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <img src="https://fastfwdus.com/wp-content/uploads/2025/04/logorwhitehorizontal.png" alt="FastForward"
          style={{height:28,objectFit:'contain',display:'block'}}
          onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
        <p style={{color:'rgba(255,255,255,0.3)',fontSize:10,letterSpacing:3,textTransform:'uppercase',marginTop:6,margin:'6px 0 0'}}>FDA Certificates</p>
      </div>
      <nav style={{flex:1,padding:'12px',display:'flex',flexDirection:'column',gap:2}}>
        {nav.map(({href,label})=>(
          <Link key={href} href={href} style={{
            display:'flex',alignItems:'center',gap:10,padding:'10px 12px',
            borderRadius:8,fontSize:13,textDecoration:'none',
            color:isActive(href)?'white':'rgba(255,255,255,0.55)',
            background:isActive(href)?'rgba(255,255,255,0.1)':'transparent',
            fontWeight:isActive(href)?500:400,
          }}>{label}</Link>
        ))}
      </nav>
      <div style={{padding:'12px',borderTop:'1px solid rgba(255,255,255,0.1)'}}>
        <button onClick={handleLogout} style={{
          display:'flex',alignItems:'center',gap:10,padding:'10px 12px',
          borderRadius:8,fontSize:13,background:'transparent',border:'none',
          cursor:'pointer',color:'rgba(255,255,255,0.4)',width:'100%',
        }}>Sign out</button>
      </div>
    </aside>
  )
}
