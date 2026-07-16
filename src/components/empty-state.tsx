interface EmptyStateProps {
  title: string
  description: string
}

/**
 * A deliberate empty state (dashed container, title + description) instead
 * of a floating "No X yet" line — per empty-state UX research, a blank
 * screen with small print reads as broken, not "there's nothing here yet."
 */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center border-black/15">
      <p className="font-medium mb-1">{title}</p>
      <p className="text-sm opacity-60 max-w-xs mx-auto">{description}</p>
    </div>
  )
}
