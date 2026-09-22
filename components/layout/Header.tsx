export default function Header({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6">
      <h2 className="text-display-md font-bold text-ink">{title}</h2>
      {description && <p className="mt-1 text-body-sm text-muted">{description}</p>}
    </header>
  )
}
