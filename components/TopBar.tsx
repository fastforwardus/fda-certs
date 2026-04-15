'use client'

interface Props {
  user: { name: string; email: string; role: string }
}

export default function TopBar({ user }: Props) {
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div className="text-sm text-gray-500">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{user.name}</span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
          style={{ background: user.role === 'admin' ? '#1a3a5c' : '#185FA5' }}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
