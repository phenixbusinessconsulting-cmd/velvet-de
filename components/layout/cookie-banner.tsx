"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, Cookie } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/context/locale"
import { cn } from "@/lib/utils"

// LEGAL NOTE (DE): DSGVO Art. 6 / ePrivacy — cookie consent required
// Cookie consent must be granular (essential vs. analytics vs. marketing)

type ConsentState = {
  essential: true   // Always true — cannot be disabled
  analytics: boolean
  marketing: boolean
}

export function CookieBanner() {
  const { t } = useLocale()
  const cb = t.cookieBanner
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [prefs, setPrefs] = useState<ConsentState>({
    essential: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const saved = localStorage.getItem("velvet_cookie_consent")
    if (!saved) {
      // Small delay so page loads first
      setTimeout(() => setVisible(true), 1200)
    }
  }, [])

  function saveConsent(state: ConsentState) {
    localStorage.setItem("velvet_cookie_consent", JSON.stringify({ ...state, savedAt: Date.now() }))
    // Log consent to backend (DSGVO Art. 7 — documented consent)
    fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "COOKIES", granted: state }),
    }).catch(() => {})
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 inset-x-4 md:left-auto md:right-6 md:max-w-md z-[90]",
        "glass-gold rounded-[var(--r-2xl)] p-5 shadow-[var(--shadow-xl)]",
        "animate-fadeInUp"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Cookie className="w-4 h-4 text-[var(--gold)]" />
          <span className="text-xs font-semibold tracking-wide text-[var(--pearl)] uppercase">
            {cb.title}
          </span>
        </div>
        <button
          onClick={() => saveConsent({ essential: true, analytics: false, marketing: false })}
          className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          aria-label={t.common.close}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
        {cb.description}{" "}
        <Link href="/datenschutz" className="text-[var(--gold)] hover:underline">
          {cb.privacyLink}
        </Link>
      </p>

      {/* Details */}
      {showDetails && (
        <div className="mb-4 space-y-2">
          {[
            { key: "essential", label: cb.essential, desc: cb.essentialDesc, locked: true },
            { key: "analytics", label: cb.analytics, desc: cb.analyticsDesc, locked: false },
            { key: "marketing", label: cb.marketing, desc: cb.marketingDesc, locked: false },
          ].map(({ key, label, desc, locked }) => (
            <label
              key={key}
              className={cn(
                "flex items-center justify-between p-3 rounded-[var(--r-lg)]",
                "bg-[var(--surface-3)] border border-[var(--border)]",
                locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              )}
            >
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">{label}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{desc}</p>
              </div>
              <div className={cn(
                "w-8 h-4.5 rounded-full transition-all duration-[220ms] flex-shrink-0",
                "border",
                (key === "essential" || prefs[key as keyof ConsentState])
                  ? "bg-[var(--gold)] border-[var(--gold-dark)]"
                  : "bg-[var(--surface-4)] border-[var(--border)]"
              )}>
                <div className={cn(
                  "w-3 h-3 rounded-full bg-white mt-px transition-transform duration-[220ms]",
                  (key === "essential" || prefs[key as keyof ConsentState])
                    ? "translate-x-4"
                    : "translate-x-0.5"
                )} />
              </div>
              {!locked && (
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={!!prefs[key as keyof ConsentState]}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, [key]: e.target.checked }))
                  }
                />
              )}
            </label>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          variant="gold"
          size="sm"
          className="w-full"
          onClick={() => saveConsent({ essential: true, analytics: true, marketing: true })}
        >
          {cb.acceptAll}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="surface"
            size="sm"
            className="flex-1"
            onClick={() => saveConsent({ essential: true, analytics: false, marketing: false })}
          >
            {cb.essential}
          </Button>
          {showDetails ? (
            <Button
              variant="gold-outline"
              size="sm"
              className="flex-1"
              onClick={() => saveConsent(prefs)}
            >
              {cb.savePreferences}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => setShowDetails(true)}
            >
              {cb.analytics}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
