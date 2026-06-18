"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/context/locale"
import { cn } from "@/lib/utils"
import de from "@/messages/de"
import fr from "@/messages/fr"

type Lang = "fr" | "de"

export function AgeGate() {
  const { locale: ctxLocale } = useLocale()
  const [lang, setLang] = useState<Lang>(ctxLocale as Lang)
  const [confirmed, setConfirmed] = useState(false)
  const [declined, setDeclined] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") ?? "/verzeichnis"

  // Use inline message objects — independent of the server-rendered locale
  const ag = lang === "fr" ? fr.ageGate : de.ageGate

  async function switchLang(newLang: Lang) {
    setLang(newLang)
    // Persist preference so the rest of the site loads in the right language
    await fetch("/api/set-lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: newLang }),
    })
  }

  async function handleEnter() {
    if (!confirmed || isLoading) return
    setIsLoading(true)
    const res = await fetch("/api/age-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmed: true }),
    })
    if (res.ok) {
      router.push(nextPath)
      router.refresh()
    } else {
      setIsLoading(false)
    }
  }

  if (declined) {
    return (
      <div className="fixed inset-0 bg-[var(--noir)] flex flex-col items-center justify-center z-[100] p-6">
        <AlertTriangle className="w-10 h-10 text-[var(--warning)] mb-6" />
        <h2
          className="font-display text-2xl text-[var(--pearl)] mb-3 text-center"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {ag.declinedTitle}
        </h2>
        <p className="text-sm text-[var(--text-muted)] text-center max-w-sm">{ag.declinedText}</p>
      </div>
    )
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
          "relative glass-gold rounded-[var(--r-3xl)] p-8 sm:p-12 max-w-md w-full",
          "shadow-[0_0_80px_rgba(201,169,110,0.08),0_24px_80px_rgba(0,0,0,0.8)]",
          "animate-fadeInUp"
        )}
      >
        <div className="absolute top-0 left-8 right-8 h-px gradient-gold opacity-60 rounded-full" />

        {/* Language switcher */}
        <div className="absolute top-4 right-4 flex items-center gap-0.5 bg-[var(--surface-3)] rounded-full p-0.5 border border-[var(--border)]">
          {(["fr", "de"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => switchLang(l)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all duration-[200ms]",
                lang === l
                  ? "bg-[var(--gold)] text-[var(--noir)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              {l === "fr" ? "FR" : "DE"}
            </button>
          ))}
        </div>

        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        <div className="divider-gold mb-8" />

        <div className="text-center mb-8">
          <p className="label-luxury mb-3">{ag.label}</p>
          <h2
            className="text-2xl sm:text-3xl font-light text-[var(--pearl)] mb-4 leading-snug"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {ag.title}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {ag.description}{" "}
            <span className="text-[var(--gold)]">{ag.descriptionAge}</span>{" "}
            {ag.descriptionEnd}
          </p>
        </div>

        <label
          className={cn(
            "flex items-start gap-3 p-4 rounded-[var(--r-xl)] cursor-pointer",
            "border transition-all duration-[220ms]",
            confirmed
              ? "bg-[var(--gold-muted)] border-[var(--border-gold)]"
              : "bg-[var(--surface-3)] border-[var(--border)] hover:border-[var(--border-hover)]"
          )}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="sr-only"
          />
          <div
            className={cn(
              "flex-shrink-0 w-5 h-5 rounded-[var(--r-sm)] border mt-0.5",
              "flex items-center justify-center transition-all duration-[220ms]",
              confirmed
                ? "bg-[var(--gold)] border-[var(--gold)]"
                : "border-[var(--border-strong)] bg-transparent"
            )}
          >
            {confirmed && (
              <svg
                className="w-3 h-3 text-[var(--noir)]"
                fill="none"
                viewBox="0 0 12 12"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M2 6L5 9L10 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {ag.checkboxText}{" "}
            <strong className="text-[var(--pearl)]">{ag.checkboxAge}</strong>{" "}
            {ag.checkboxAnd}{" "}
            <a href={lang === "fr" ? "/agb" : "/agb"} target="_blank" className="text-[var(--gold)] hover:underline">
              {ag.checkboxTerms}
            </a>
            {" "}{ag.checkboxAnd2}{" "}
            <a href="/datenschutz" target="_blank" className="text-[var(--gold)] hover:underline">
              {ag.checkboxPrivacy}
            </a>
            {ag.checkboxEnd}
          </span>
        </label>

        <div className="mt-5 flex flex-col gap-3">
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            disabled={!confirmed || isLoading}
            onClick={handleEnter}
          >
            {isLoading ? ag.loading : ag.enter}
          </Button>
          <Button
            variant="ghost"
            size="default"
            className="w-full text-[var(--text-muted)] text-xs"
            onClick={() => setDeclined(true)}
          >
            {ag.leave}
          </Button>
        </div>

        <p className="mt-6 text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
          {ag.legalNote}
        </p>
      </div>
    </div>
  )
}
