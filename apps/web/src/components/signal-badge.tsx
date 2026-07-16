import { Badge } from '@/components/ui/badge'
import type { Signal } from '@theo/types'

const signalConfig: Record<Signal, { label: string; className: string; dot: string }> = {
  green: {
    label: '绿灯',
    className: 'border-signal-green/30 text-signal-green bg-signal-green/10',
    dot: 'bg-signal-green',
  },
  yellow: {
    label: '黄灯',
    className: 'border-signal-yellow/30 text-signal-yellow bg-signal-yellow/10',
    dot: 'bg-signal-yellow',
  },
  red: {
    label: '红灯',
    className: 'border-signal-red/30 text-signal-red bg-signal-red/10',
    dot: 'bg-signal-red',
  },
}

export function SignalBadge({ signal, size = 'default' }: { signal: Signal; size?: 'sm' | 'default' }) {
  const cfg = signalConfig[signal]
  return (
    <Badge variant="outline" className={`${cfg.className} gap-1.5 font-medium`}>
      <span className={`inline-block rounded-full ${cfg.dot} ${size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'}`} />
      {cfg.label}
    </Badge>
  )
}
