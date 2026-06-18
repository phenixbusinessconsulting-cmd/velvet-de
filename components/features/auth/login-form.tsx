"use client"

import { useTransition, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocale } from "@/context/locale"
import { cn } from "@/lib/utils"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
type FormData = z.infer<typeof schema>

interface Props {
  redirectTo?: string
}

export function LoginForm({ redirectTo = "/dashboard" }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showPw, setShowPw] = useState(false)
  const { t } = useLocale()
  const a = t.auth

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  function onSubmit(data: FormData) {
    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, redirectTo }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? a.loginError)
        return
      }
      window.location.href = json.redirectTo ?? redirectTo
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Field label={a.fieldEmail} error={errors.email?.message}>
        <Input
          {...register("email")}
          type="email"
          placeholder={a.fieldEmailPlaceholder}
          autoComplete="email"
          error={!!errors.email}
        />
      </Field>

      <Field label={a.fieldPassword} error={errors.password?.message}>
        <div className="relative">
          <Input
            {...register("password")}
            type={showPw ? "text" : "password"}
            placeholder={a.fieldPasswordPlaceholder}
            autoComplete="current-password"
            error={!!errors.password}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            aria-label={showPw ? a.hidePassword : a.showPassword}
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : a.loginButton}
      </Button>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">{label}</label>
      {children}
      {error && <p className="text-xs text-[var(--error)]">{error}</p>}
    </div>
  )
}
