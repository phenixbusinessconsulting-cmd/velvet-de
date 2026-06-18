import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "gold" | "surface" | "success" | "warning" | "error" | "muted"
  size?: "sm" | "default"
  className?: string
}

export function Badge({ children, variant = "surface", size = "default", className }: BadgeProps) {
  const variants = {
    gold:    "bg-[var(--gold-muted)] border-[var(--border-gold)] text-[var(--gold)]",
    surface: "bg-[var(--surface-3)] border-[var(--border)] text-[var(--text-secondary)]",
    success: "bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]",
    warning: "bg-[var(--warning)]/10 border-[var(--warning)]/20 text-[var(--warning)]",
    error:   "bg-[var(--error)]/10 border-[var(--error)]/20 text-[var(--error)]",
    muted:   "bg-transparent border-[var(--border)] text-[var(--text-muted)]",
  }

  const sizes = {
    sm:      "px-2 py-0.5 text-[10px] tracking-[0.1em] rounded-[var(--r-sm)]",
    default: "px-2.5 py-1 text-[11px] tracking-[0.08em] rounded-[var(--r-md)]",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center border font-medium uppercase",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
