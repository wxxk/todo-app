import { WeeklyGoalItem as WeeklyGoalItemType } from '@/types'

interface WeeklyGoalItemProps {
  item: WeeklyGoalItemType
  onToggle: (done: boolean) => void
}

export default function WeeklyGoalItem({ item, onToggle }: WeeklyGoalItemProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-surface-soft">
      <input
        type="checkbox"
        checked={item.done}
        onChange={(e) => onToggle(e.target.checked)}
        className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary"
      />
      <span className={item.done ? 'text-muted-soft line-through' : 'text-ink'}>{item.text}</span>
    </label>
  )
}
