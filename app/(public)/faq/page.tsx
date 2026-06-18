import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getLocale, getMessages } from "@/lib/locale"

export const metadata: Metadata = {
  title: "FAQ — Häufige Fragen / Questions fréquentes",
  description: "Antworten auf die häufigsten Fragen zu VELVET.",
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group card-luxury overflow-hidden">
      <summary className="p-5 cursor-pointer flex items-center justify-between gap-3 list-none">
        <span className="text-sm font-medium text-[var(--pearl)] group-open:text-[var(--gold)] transition-colors">{q}</span>
        <span className="text-[var(--gold)] transition-transform duration-[220ms] group-open:rotate-45 flex-shrink-0 text-xl leading-none">+</span>
      </summary>
      <div className="px-5 pb-5 pt-0 border-t border-[var(--border)]">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-4">{a}</p>
      </div>
    </details>
  )
}

export default async function FAQPage() {
  const locale = await getLocale()
  const t = await getMessages(locale)
  const f = t.faq

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center py-12">
            <p className="label-luxury mb-3">{f.label}</p>
            <h1
              className="heading-luxury text-4xl text-[var(--pearl)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {f.title}
            </h1>
          </div>

          <section className="mb-10">
            <h2 className="label-luxury mb-5">{f.visitorLabel}</h2>
            <div className="space-y-3">
              {f.visitor.map((item) => <FAQItem key={item.q} {...item} />)}
            </div>
          </section>

          <section>
            <h2 className="label-luxury mb-5">{f.professionalLabel}</h2>
            <div className="space-y-3">
              {f.professional.map((item) => <FAQItem key={item.q} {...item} />)}
            </div>
          </section>

          <div className="mt-12 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              {f.moreQuestions}{" "}
              <a href="/kontakt" className="text-[var(--gold)] hover:underline">
                {f.contactUs}
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
