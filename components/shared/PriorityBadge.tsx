import { TodoPriority } from '@/types'
import Badge from './Badge'

const STYLES: Record<TodoPriority, string> = {
  high: 'bg-primary-disabled text-primary-active',
  medium: 'bg-surface-strong text-ink',
  low: 'bg-surface-soft text-muted',
}

const LABELS: Record<TodoPriority, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
}

export default function PriorityBadge({ priority }: { priority: TodoPriority }) {
  return <Badge className={STYLES[priority]}>{LABELS[priority]}</Badge>
}
