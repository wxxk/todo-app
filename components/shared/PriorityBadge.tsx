import { TodoPriority } from '@/types'
import Badge from './Badge'

const STYLES: Record<TodoPriority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
}

const LABELS: Record<TodoPriority, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
}

export default function PriorityBadge({ priority }: { priority: TodoPriority }) {
  return <Badge className={STYLES[priority]}>{LABELS[priority]}</Badge>
}
