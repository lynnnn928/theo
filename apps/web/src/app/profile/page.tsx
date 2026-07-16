import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">能力档案</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        沉淀你的能力地图，获得 JD 匹配分析
      </p>

      <Card className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-3 text-3xl font-bold text-muted-foreground/30">即将上线</div>
        <p className="text-sm text-muted-foreground">
          能力档案功能正在开发中，敬请期待
        </p>
      </Card>
    </div>
  )
}
