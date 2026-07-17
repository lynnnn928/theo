import { redirect } from 'next/navigation'

// 首页统一跳转到 /tasks（middleware 会处理未登录的重定向）
export default function Home() {
  redirect('/tasks')
}
