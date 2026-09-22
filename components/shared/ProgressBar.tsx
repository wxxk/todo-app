export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>진행률</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full rounded-full bg-neutral-900 transition-all dark:bg-neutral-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
