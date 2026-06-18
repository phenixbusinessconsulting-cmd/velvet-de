"use client"

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/context/locale"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user?: { id: string; role: string } | null
}

export function Header({ user }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()
  const router = useRouter()
  const { t, locale } = useLocale()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  const navLinks = [
    { href: "/verzeichnis", label: t.nav.directory },
    { href: "/vertrauen",   label: t.nav.trust },
    { href: "/faq",         label: t.nav.faq },
    { href: "/kontakt",     label: t.nav.contact },
  ]

  function switchLang() {
    const newLocale = locale === "de" ? "fr" : "de"
    startTransition(async () => {
      await fetch("/api/set-lang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      })
      router.refresh()
    })
  }

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-[380ms]",
        scrolled
          ? "glass border-b border-[var(--border)] py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">

          <Logo size="sm" />

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors duration-[220ms] rounded-[var(--r-lg)]",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "text-[var(--gold)] bg-[var(--gold-muted)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {/* Language toggle DE ↔ FR */}
            <button
              onClick={switchLang}
              disabled={isPending}
              className={cn(
                "flex items-center px-2.5 py-1.5 rounded-[var(--r-lg)] text-xs tracking-widest uppercase transition-all border",
                "border-[var(--border-gold)] text-[var(--gold)] hover:bg-[var(--gold-muted)]",
                isPending && "opacity-50 cursor-not-allowed"
              )}
              aria-label={t.nav.changeLang}
            >
              {locale === "de" ? "FR" : "DE"}
            </button>

            <div className="w-px h-5 bg-[var(--border)]" />

            {user ? (
              <>
                {["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role) && (
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/admin">{t.nav.admin}</Link>
                  </Button>
                )}
                <Button asChild size="sm" variant="gold">
                  <Link href="/dashboard">{t.nav.myArea}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/anmelden">{t.nav.login}</Link>
                </Button>
                <Button asChild size="sm" variant="gold-outline">
                  <Link href="/registrieren">{t.nav.register}</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? t.common.close : "Menu"}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden glass border-t border-[var(--border)] mt-3 animate-fadeIn">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--pearl)] hover:bg-[var(--surface-3)] rounded-[var(--r-lg)] transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="divider-gold my-3" />
            <button
              onClick={switchLang}
              disabled={isPending}
              className="px-4 py-3 text-sm text-[var(--gold)] border border-[var(--border-gold)] rounded-[var(--r-lg)] tracking-widest uppercase"
            >
              {locale === "de" ? "Français" : "Deutsch"}
            </button>
            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                <Button asChild variant="gold" className="w-full">
                  <Link href="/dashboard">{t.nav.myArea}</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="gold-outline" className="w-full">
                    <Link href="/anmelden">{t.nav.login}</Link>
                  </Button>
                  <Button asChild variant="gold" className="w-full">
                    <Link href="/registrieren">{t.nav.register}</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
