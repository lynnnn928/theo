'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/tasks', label: '任务' },
  { href: '/profile', label: '档案' },
]

export function AppNav() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/tasks" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-primary">Theo</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">JD 洞察</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* User menu */}
          {!loading && user && (
            <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
              <span className="hidden max-w-[120px] truncate text-xs text-muted-foreground sm:inline">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-8 text-xs">
                退出
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
