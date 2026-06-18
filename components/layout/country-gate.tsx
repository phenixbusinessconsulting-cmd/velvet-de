"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { useLocale } from "@/context/locale"
import { cn } from "@/lib/utils"

interface CountryOption {
  slug: string
  nameDE: string
  nameEN: string
  flag: string | null
}

export function CountryGate({ countries }: { countries: CountryOption[] }) {
  const { t } = useLocale()
  const cg = t.countryGate
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") ?? "/verzeichnis"
  const [loading, setLoading] = useState<string | null>(null)

  async function pick(slug: string) {
    if (loading) return
    setLoading(slug)
    const res = await fetch("/api/country-select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
    if (res.ok) {
      router.push(nextPath)
      router.refresh()
    } else {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--noir)]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        className={cn(
          "relative glass-gold rounded-[var(--r-3xl)] p-8 sm:p-12 max-w-lg w-full",
          "shadow-[0_0_80px_rgba(201,169,110,0.08),0_24px_80px_rgba(0,0,0,0.8)]",
          "animate-fadeInUp"
        )}
      >
        <div className="absolute top-0 left-8 right-8 h-px gradient-gold opacity-60 rounded-full" />

        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        <div className="divider-gold mb-8" />

        <div className="text-center mb-8">
          <p className="label-luxury mb-3">{cg.label}</p>
          <h2
            className="text-2xl sm:text-3xl font-light text-[var(--pearl)] mb-4 leading-snug"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {cg.title}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{cg.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {countries.map((country) => (
            <button
              key={country.slug}
              onClick={() => pick(country.slug)}
              disabled={loading !== null}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-[var(--r-xl)] border transition-all duration-[220ms]",
                "bg-[var(--surface-3)] border-[var(--border)]",
                "hover:border-[var(--border-gold)] hover:bg-[var(--gold-muted)]",
                loading === country.slug && "border-[var(--border-gold)] bg-[var(--gold-muted)]",
                loading !== null && loading !== country.slug && "opacity-40"
              )}
            >
              <span className="text-3xl leading-none">
                {loading === country.slug ? (
                  <Loader2 className="w-7 h-7 animate-spin text-[var(--gold)]" />
                ) : (
                  country.flag ?? "🏳️"
                )}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">{country.nameDE}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
