import { WeeklyGoalItem as WeeklyGoalItemType } from '@/types'

interface WeeklyGoalItemProps {
  item: WeeklyGoalItemType
  onToggle: (done: boolean) => void
}

export default function WeeklyGoalItem({ item, onToggle }: WeeklyGoalItemProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800">
      <input
        type="checkbox"
        checked={item.done}
        onChange={(e) => onToggle(e.target.checked)}
        className="h-4 w-4 rounded border-neutral-300"
      />
      <span className={item.done ? 'text-neutral-400 line-through' : 'text-neutral-800 dark:text-neutral-200'}>
        {item.text}
      </span>
    </label>
  )
}
