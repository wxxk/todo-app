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
    <aside className="w-full shrink-0 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 sm:flex sm:h-screen sm:w-56 sm:flex-col sm:border-b-0 sm:border-r">
      <div className="p-4">
        <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">할 일 관리</h1>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-2 sm:flex-col sm:overflow-visible sm:pb-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-neutral-200 p-4 dark:border-neutral-800">
        {user ? (
          <div className="flex items-center gap-2">
            {user.avatarUrl && (
              <Image
                src={user.avatarUrl}
                alt={user.username}
                width={28}
                height={28}
                className="rounded-full"
                unoptimized
              />
            )}
            <span className="flex-1 truncate text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {user.username}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <a
            href="/auth/github"
            className="block rounded-md bg-neutral-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900"
          >
            GitHub로 로그인
          </a>
        )}
      </div>
    </aside>
  )
}
