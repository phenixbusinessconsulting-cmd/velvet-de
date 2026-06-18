import type { Metadata } from "next"
import { Shield, CheckCircle2, Lock, Flag, Eye, FileCheck } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getLocale, getMessages } from "@/lib/locale"

export const metadata: Metadata = {
  title: "Vertrauen & Sicherheit / Confiance & Sécurité",
  description: "Wie VELVET Sicherheit, Verifizierung und DSGVO-Compliance gewährleistet.",
}

const SECTION_ICONS = [CheckCircle2, Shield, Lock, FileCheck, Flag, Eye]

export default async function TrustSafetyPage() {
  const locale = await getLocale()
  const t = await getMessages(locale)
  const tr = t.trust

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center py-12">
            <p className="label-luxury mb-3">{tr.label}</p>
            <h1
              className="heading-luxury text-4xl sm:text-5xl text-[var(--pearl)] mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {tr.title}
            </h1>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              {tr.description}
            </p>
          </div>

          {/* Trust grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {tr.sections.map(({ title, points }, idx) => {
              const Icon = SECTION_ICONS[idx]
              return (
                <div key={title} className="card-luxury p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[var(--r-xl)] bg-[var(--gold-muted)] border border-[var(--border-gold)] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[var(--gold)]" strokeWidth={1.5} />
                    </div>
                    <h2
                      className="text-base font-light text-[var(--pearl)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {title}
                    </h2>
                  </div>
                  <ul className="space-y-2">
                    {points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                        <span className="text-[var(--success)] mt-0.5 flex-shrink-0">✓</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Report section */}
          <div className="mt-12 rounded-[var(--r-2xl)] border border-[var(--border-gold)] p-8 text-center"
            style={{ background: "linear-gradient(135deg, var(--surface-2), var(--navy))" }}>
            <Flag className="w-8 h-8 text-[var(--error)] mx-auto mb-4" />
            <h2
              className="text-2xl font-light text-[var(--pearl)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {tr.reportTitle}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6 leading-relaxed">
              {tr.reportDesc}
            </p>
            <a
              href="/kontakt?type=report"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--r-xl)] border border-[var(--error)]/30 bg-[var(--error)]/10 text-[var(--error)] text-sm font-medium hover:bg-[var(--error)]/20 transition-colors"
            >
              <Flag className="w-4 h-4" />
              {tr.reportCta}
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
