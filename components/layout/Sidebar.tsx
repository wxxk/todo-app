'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: '대시보드' },
  { href: '/todos', label: '할 일' },
  { href: '/weekly', label: '주간 계획' },
  { href: '/goals', label: '1년 목표' },
]

export interface SidebarUser {
  username: string
  avatarUrl?: string
}

export default function Sidebar({ user }: { user: SidebarUser | null }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/auth/logout', { method: 'POST' })
    // The root layout reads the session server-side, so a client push alone
    // won't re-run it — refresh() forces the server components to re-fetch.
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-full shrink-0 border-b border-hairline bg-canvas sm:flex sm:h-screen sm:w-56 sm:flex-col sm:border-b-0 sm:border-r">
      <div className="p-4">
        <h1 className="text-title-md font-semibold tracking-tight text-primary">할 일 관리</h1>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-2 sm:flex-col sm:overflow-visible sm:pb-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-sm px-3 py-2 text-nav-link font-semibold transition-colors ${
                active ? 'bg-surface-soft text-ink' : 'text-muted hover:bg-surface-soft hover:text-ink'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-hairline p-4">
        {user ? (
          <div className="flex items-center gap-2">
            {user.avatarUrl && (
              <Image src={user.avatarUrl} alt={user.username} width={28} height={28} className="rounded-full" unoptimized />
            )}
            <span className="flex-1 truncate text-title-sm font-medium text-ink">{user.username}</span>
            <button onClick={handleLogout} className="btn-text">
              로그아웃
            </button>
          </div>
        ) : (
          <a href="/auth/github" className="btn-primary block w-full text-center">
            GitHub로 로그인
          </a>
        )}
      </div>
    </aside>
  )
}
