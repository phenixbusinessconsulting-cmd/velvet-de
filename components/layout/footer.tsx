"use client"

import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { useLocale } from "@/context/locale"

export function Footer() {
  const { t } = useLocale()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-20">
      <div className="divider-gold" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Logo size="sm" />
            <p className="mt-5 text-xs text-[var(--text-muted)] leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["DSGVO / RGPD", "18+", "Verified"].map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-1 text-[9px] tracking-[0.15em] uppercase border border-[var(--border-gold)] text-[var(--gold)] rounded-[var(--r-sm)]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="label-luxury mb-5">{t.footer.platform}</h4>
            <ul className="space-y-3">
              {[
                { href: "/verzeichnis", label: t.footer.links.directory },
                { href: "/suche",       label: t.footer.links.search },
                { href: "/vertrauen",   label: t.footer.links.trust },
                { href: "/faq",         label: t.footer.links.faq },
                { href: "/kontakt",     label: t.footer.links.contact },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors duration-[220ms]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Professionals */}
          <div>
            <h4 className="label-luxury mb-5">{t.footer.professionals}</h4>
            <ul className="space-y-3">
              {[
                { href: "/registrieren", label: t.footer.links.createProfile },
                { href: "/anmelden",     label: t.footer.links.login },
                { href: "/dashboard",    label: t.footer.links.dashboard },
                { href: "/faq",          label: t.footer.links.howItWorks },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors duration-[220ms]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="label-luxury mb-5">{t.footer.legal}</h4>
            <ul className="space-y-3">
              {[
                { href: "/impressum",   label: t.footer.links.impressum },
                { href: "/datenschutz", label: t.footer.links.privacy },
                { href: "/agb",         label: t.footer.links.terms },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors duration-[220ms]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © {year} VELVET Group GmbH. {t.footer.copyright}
          </p>
          <p className="text-xs text-[var(--text-muted)] text-center">
            {t.footer.ageRestriction}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] inline-block" />
            {t.footer.systemsOperational}
          </div>
        </div>
      </div>
    </footer>
  )
}
