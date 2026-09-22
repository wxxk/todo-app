import Link from 'next/link'
import { WeeklyPlan } from '@/types'
import ProgressBar from '@/components/shared/ProgressBar'
import { formatDate } from '@/lib/utils'

export default function WeeklyPlanCard({ plan }: { plan: WeeklyPlan }) {
  return (
    <Link href={`/weekly/${plan._id}`} className="card-surface hover:shadow-card block p-4">
      <h3 className="mb-2 text-title-md font-semibold text-ink">{formatDate(plan.weekStart)} 주간 계획</h3>
      <ul className="mb-3 space-y-0.5 text-body-sm text-body">
        {plan.goals.slice(0, 3).map((g, i) => (
          <li key={i} className={g.done ? 'text-muted-soft line-through' : ''}>
            · {g.text}
          </li>
        ))}
      </ul>
      <ProgressBar progress={plan.progress ?? 0} />
    </Link>
  )
}
