"use client"

import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--surface-3)",
            border: "1px solid var(--border-gold)",
            color: "var(--text-primary)",
            borderRadius: "var(--r-xl)",
          },
          classNames: {
            success: "border-[var(--success)]/30",
            error: "border-[var(--error)]/30",
          },
        }}
      />
    </>
  )
}
