import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full h-11 px-4 rounded-[var(--r-xl)] text-sm",
        "bg-[var(--surface-3)] border text-[var(--text-primary)]",
        "placeholder:text-[var(--text-muted)]",
        "transition-colors duration-[220ms]",
        "focus:outline-none focus:ring-1",
        error
          ? "border-[var(--error)]/40 focus:ring-[var(--error)]/30 focus:border-[var(--error)]/60"
          : "border-[var(--border)] hover:border-[var(--border-hover)] focus:ring-[var(--gold)]/30 focus:border-[var(--border-gold)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full px-4 py-3 rounded-[var(--r-xl)] text-sm",
        "bg-[var(--surface-3)] border text-[var(--text-primary)]",
        "placeholder:text-[var(--text-muted)]",
        "resize-none transition-colors duration-[220ms]",
        "focus:outline-none focus:ring-1",
        error
          ? "border-[var(--error)]/40 focus:ring-[var(--error)]/30 focus:border-[var(--error)]/60"
          : "border-[var(--border)] hover:border-[var(--border-hover)] focus:ring-[var(--gold)]/30 focus:border-[var(--border-gold)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"
