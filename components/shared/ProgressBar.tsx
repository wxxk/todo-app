export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-caption-sm text-muted">
        <span>진행률</span>
        <span className="font-medium text-ink">{progress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-strong">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
