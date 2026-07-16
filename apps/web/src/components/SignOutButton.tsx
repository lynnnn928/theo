'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()
  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut}>
      退出
    </Button>
  )
}
