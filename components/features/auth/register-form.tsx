"use client"

import { useTransition, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocale } from "@/context/locale"
import { cn } from "@/lib/utils"

const schema = z
  .object({
    displayName: z.string().min(2).max(60),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string(),
    ageConfirm: z.literal(true, { errorMap: () => ({ message: "" }) }),
    acceptAGB: z.literal(true, { errorMap: () => ({ message: "" }) }),
    acceptPrivacy: z.literal(true, { errorMap: () => ({ message: "" }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof schema>

export function RegisterForm() {
  const [isPending, startTransition] = useTransition()
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { t } = useLocale()
  const a = t.auth

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ageConfirm: undefined as unknown as true, acceptAGB: undefined as unknown as true, acceptPrivacy: undefined as unknown as true },
  })

  const password = watch("password", "")
  const pwChecks = {
    length:  password.length >= 8,
    upper:   /[A-Z]/.test(password),
    number:  /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  function onSubmit(data: FormData) {
    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: data.displayName, email: data.email, password: data.password }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Fehler / Erreur")
        return
      }
      window.location.href = "/dashboard"
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Field label={a.fieldName} error={errors.displayName?.message}>
        <Input {...register("displayName")} type="text" placeholder={a.fieldNamePlaceholder} autoComplete="name" error={!!errors.displayName} />
      </Field>

      <Field label={a.fieldEmail} error={errors.email?.message}>
        <Input {...register("email")} type="email" placeholder={a.fieldEmailPlaceholder} autoComplete="email" error={!!errors.email} />
      </Field>

      <Field label={a.fieldPassword} error={errors.password?.message}>
        <div className="relative">
          <Input
            {...register("password")}
            type={showPw ? "text" : "password"}
            placeholder={a.fieldPasswordPlaceholder}
            autoComplete="new-password"
            error={!!errors.password}
            className="pr-10"
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-1">
            {[
              { ok: pwChecks.length,  label: "8+" },
              { ok: pwChecks.upper,   label: "A-Z" },
              { ok: pwChecks.number,  label: "0-9" },
              { ok: pwChecks.special, label: "#@!" },
            ].map(({ ok, label }) => (
              <div key={label} className="flex items-center gap-1 text-[10px]">
                {ok ? <CheckCircle2 className="w-3 h-3 text-[var(--success)]" /> : <XCircle className="w-3 h-3 text-[var(--border-strong)]" />}
                <span className={ok ? "text-[var(--success)]" : "text-[var(--text-muted)]"}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </Field>

      <Field label={a.fieldConfirmPassword} error={errors.confirmPassword?.message}>
        <div className="relative">
          <Input
            {...register("confirmPassword")}
            type={showConfirm ? "text" : "password"}
            placeholder={a.fieldPasswordPlaceholder}
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            className="pr-10"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      {/* Checkboxes */}
      <div className="pt-2 space-y-3">
        {[
          { name: "ageConfirm" as const, label: a.checkAge },
          { name: "acceptAGB" as const,  label: a.checkTerms },
          { name: "acceptPrivacy" as const, label: a.checkPrivacy },
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input {...register(name)} type="checkbox" className="sr-only" />
              <div className="flex-shrink-0 w-4 h-4 mt-0.5 rounded-[var(--r-sm)] border border-[var(--border-strong)] bg-[var(--surface-4)]" />
              <span className="text-xs text-[var(--text-secondary)] leading-relaxed">{label}</span>
            </label>
            {errors[name]?.message && <p className="text-xs text-[var(--error)] mt-1 ml-7">{errors[name]?.message}</p>}
          </div>
        ))}
      </div>

      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : a.registerButton}
      </Button>
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">{label}</label>
      {children}
      {error && <p className="text-xs text-[var(--error)]">{error}</p>}
    </div>
  )
}
