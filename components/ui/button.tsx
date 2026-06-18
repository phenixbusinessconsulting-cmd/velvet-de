import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium transition-all duration-[220ms] cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)]",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary gold CTA
        gold: [
          "gradient-gold text-[var(--noir)] shadow-[var(--shadow-gold)]",
          "hover:shadow-[var(--shadow-gold-lg)] hover:brightness-110",
          "active:brightness-95 active:scale-[0.98]",
          "font-semibold tracking-wide",
        ].join(" "),
        // Ghost gold outline
        "gold-outline": [
          "bg-transparent border border-[var(--border-gold)] text-[var(--gold)]",
          "hover:bg-[var(--gold-muted)] hover:border-[var(--border-gold-hover)]",
          "active:scale-[0.98]",
        ].join(" "),
        // Subtle surface
        surface: [
          "bg-[var(--surface-3)] border border-[var(--border)] text-[var(--text-primary)]",
          "hover:border-[var(--border-hover)] hover:bg-[var(--surface-4)]",
          "active:scale-[0.98]",
        ].join(" "),
        // Ghost
        ghost: [
          "bg-transparent text-[var(--text-secondary)]",
          "hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
        ].join(" "),
        // Destructive
        destructive: [
          "bg-[var(--error)]/10 border border-[var(--error)]/25 text-[var(--error)]",
          "hover:bg-[var(--error)]/20 hover:border-[var(--error)]/40",
        ].join(" "),
        // Link
        link: "bg-transparent text-[var(--gold)] underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        sm:      "h-8 px-4 text-xs rounded-[var(--r-lg)] [&_svg]:size-3.5",
        default: "h-10 px-5 text-sm rounded-[var(--r-xl)] [&_svg]:size-4",
        lg:      "h-12 px-7 text-base rounded-[var(--r-xl)] [&_svg]:size-4",
        xl:      "h-14 px-9 text-base rounded-[var(--r-2xl)] [&_svg]:size-5",
        icon:    "h-10 w-10 rounded-[var(--r-xl)] [&_svg]:size-4",
        "icon-sm": "h-8 w-8 rounded-[var(--r-lg)] [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "surface",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
