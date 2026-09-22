export default function Header({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
      {description && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
    </header>
  )
}
