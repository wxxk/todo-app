import Link from 'next/link'
import { WeeklyPlan } from '@/types'
import ProgressBar from '@/components/shared/ProgressBar'
import { formatDate } from '@/lib/utils'

export default function WeeklyPlanCard({ plan }: { plan: WeeklyPlan }) {
  return (
    <Link
      href={`/weekly/${plan._id}`}
      className="block rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
    >
      <h3 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-100">
        {formatDate(plan.weekStart)} 주간 계획
      </h3>
      <ul className="mb-3 space-y-0.5 text-sm text-neutral-600 dark:text-neutral-400">
        {plan.goals.slice(0, 3).map((g, i) => (
          <li key={i} className={g.done ? 'line-through opacity-60' : ''}>
            · {g.text}
          </li>
        ))}
      </ul>
      <ProgressBar progress={plan.progress ?? 0} />
    </Link>
  )
}
