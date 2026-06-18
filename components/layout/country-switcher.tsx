"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface CountryOption {
  slug: string
  nameDE: string
  flag: string | null
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return ""
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"))
  return match ? decodeURIComponent(match[1]) : ""
}

export function CountrySwitcher({ className }: { className?: string }) {
  const [countries, setCountries] = useState<CountryOption[]>([])
  const [current, setCurrent] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((d: CountryOption[]) => setCountries(Array.isArray(d) ? d : []))
      .catch(() => {})
    setCurrent(readCookie("velvet_country"))
  }, [])

  // Pas de pays configuré → pas de sélecteur
  if (countries.length === 0) return null

  function change(slug: string) {
    if (!slug || slug === current) return
    startTransition(async () => {
      await fetch("/api/country-select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      setCurrent(slug)
      router.refresh()
    })
  }

  return (
    <select
      value={current}
      onChange={(e) => change(e.target.value)}
      disabled={isPending}
      aria-label="Pays / Land"
      className={cn(
        "rounded-[var(--r-lg)] border border-[var(--border-gold)] bg-transparent px-2 py-1.5 text-xs",
        "text-[var(--gold)] focus:outline-none focus:border-[var(--gold)] cursor-pointer",
        isPending && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {countries.map((c) => (
        <option key={c.slug} value={c.slug} className="bg-[var(--noir)] text-[var(--text-primary)]">
          {c.flag ? `${c.flag} ` : ""}{c.nameDE}
        </option>
      ))}
    </select>
  )
}
