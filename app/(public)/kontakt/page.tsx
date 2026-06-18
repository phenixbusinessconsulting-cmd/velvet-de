import type { Metadata } from "next"
import { Mail, Shield } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { getLocale, getMessages } from "@/lib/locale"

export const metadata: Metadata = {
  title: "Kontakt / Contact",
  description: "Kontaktieren Sie das VELVET-Team.",
}

export default async function KontaktPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; profile?: string }>
}) {
  const params = await searchParams
  const isReport = params.type === "report"

  const locale = await getLocale()
  const t = await getMessages(locale)
  const c = t.contact

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="text-center py-12">
            <p className="label-luxury mb-3">{c.label}</p>
            <h1
              className="heading-luxury text-4xl text-[var(--pearl)] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {isReport ? c.titleReport : c.titleWrite}
            </h1>
            {isReport && (
              <p className="text-sm text-[var(--text-secondary)]">
                {c.reportSubtitle}
              </p>
            )}
          </div>

          <div className="card-luxury p-7 sm:p-8">
            <form className="space-y-5">
              {isReport && (
                <div className="p-3 rounded-[var(--r-lg)] bg-[var(--error)]/5 border border-[var(--error)]/20 text-xs text-[var(--error)]">
                  {c.reportNotice}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">{c.fieldFirstName}</label>
                  <Input type="text" placeholder={c.placeholderFirstName} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">{c.fieldLastName}</label>
                  <Input type="text" placeholder={c.placeholderLastName} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">{c.fieldEmail}</label>
                <Input type="email" placeholder={c.placeholderEmail} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">{c.fieldSubject}</label>
                <Input
                  type="text"
                  defaultValue={isReport ? `${c.reportSubjectPrefix} ${params.profile ?? "Profil"}` : ""}
                  placeholder={c.placeholderSubject}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">{c.fieldMessage}</label>
                <Textarea
                  rows={5}
                  placeholder={isReport ? c.placeholderReport : c.placeholderMessage}
                />
              </div>

              <Button variant="gold" size="lg" className="w-full" type="submit">
                {isReport ? c.sendReport : c.sendMessage}
              </Button>

              <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
                {c.privacyNote}{" "}
                <a href="/datenschutz" className="hover:text-[var(--gold)] transition-colors">{c.privacyLink}</a>
                {" "}{c.privacyNoteEnd}
              </p>
            </form>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <a
              href="mailto:kontakt@velvet-companions.de"
              className="card-luxury p-4 flex items-center gap-3 hover:border-[var(--border-gold)] transition-all"
            >
              <Mail className="w-5 h-5 text-[var(--gold)]" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">{c.generalLabel}</p>
                <p className="text-xs text-[var(--text-secondary)]">kontakt@velvet-companions.de</p>
              </div>
            </a>
            <a
              href="mailto:datenschutz@velvet-companions.de"
              className="card-luxury p-4 flex items-center gap-3 hover:border-[var(--border-gold)] transition-all"
            >
              <Shield className="w-5 h-5 text-[var(--gold)]" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">{c.privacyContactLabel}</p>
                <p className="text-xs text-[var(--text-secondary)]">datenschutz@velvet-companions.de</p>
              </div>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
