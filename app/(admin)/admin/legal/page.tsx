import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FileText, Pencil, Clock } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"

const LEGAL_PAGES = [
  {
    slug: "impressum",
    labelDE: "Impressum",
    labelFR: "Mentions légales",
    descDE: "Angaben gemäß §5 TMG — obligatoire en droit allemand",
    descFR: "Informations légales obligatoires — §5 TMG",
    icon: "⚖",
  },
  {
    slug: "agb",
    labelDE: "AGB — Allgemeine Geschäftsbedingungen",
    labelFR: "CGU — Conditions Générales d'Utilisation",
    descDE: "Nutzungsbedingungen der Plattform — BGB §305ff",
    descFR: "Conditions d'utilisation de la plateforme",
    icon: "📄",
  },
  {
    slug: "datenschutz",
    labelDE: "Datenschutzerklärung",
    labelFR: "Politique de Confidentialité",
    descDE: "Datenschutz gemäß DSGVO — Art. 13/14",
    descFR: "Protection des données selon le RGPD",
    icon: "🔒",
  },
]

export default async function AdminLegalPage() {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  const pages = await prisma.legalPage.findMany({
    select: { slug: true, titleDE: true, titleFR: true, updatedAt: true, contentDE: true, contentFR: true },
  })
  const pageMap = Object.fromEntries(pages.map((p) => [p.slug, p]))

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <p className="label-luxury mb-2">Admin · Pages légales</p>
        <h1 className="text-3xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
          Gestion des pages légales
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          Contenu affiché sur le site public — version DE et FR. Les modifications sont appliquées immédiatement.
        </p>
      </div>

      <div className="grid gap-4">
        {LEGAL_PAGES.map((meta) => {
          const saved = pageMap[meta.slug]
          const hasContent = saved && (saved.contentDE.length > 0 || saved.contentFR.length > 0)

          return (
            <div key={meta.slug} className="card-luxury p-6 flex items-start justify-between gap-6">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-[var(--r-lg)] bg-[var(--surface-3)] border border-[var(--border)] flex items-center justify-center text-lg flex-shrink-0">
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[var(--pearl)]">{meta.labelFR}</p>
                    <span className="text-[var(--text-muted)] text-xs">·</span>
                    <p className="text-xs text-[var(--text-muted)]">{meta.labelDE}</p>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{meta.descFR}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${hasContent ? "text-[var(--success)] bg-[var(--success)]/10" : "text-[var(--warning)] bg-[var(--warning)]/10"}`}>
                      {hasContent ? "Contenu publié" : "Non configuré"}
                    </span>
                    {saved && (
                      <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Modifié le {new Date(saved.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">/{meta.slug}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button asChild variant="surface" size="sm">
                  <Link href={`/${meta.slug}`} target="_blank" rel="noopener noreferrer">
                    <FileText className="w-3.5 h-3.5" />
                    Voir
                  </Link>
                </Button>
                <Button asChild variant="gold" size="sm">
                  <Link href={`/admin/legal/${meta.slug}`}>
                    <Pencil className="w-3.5 h-3.5" />
                    Éditer
                  </Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-[var(--r-xl)] p-4 border border-[var(--gold)]/10 bg-[var(--gold)]/5 text-xs text-[var(--text-muted)] space-y-1">
        <p><strong className="text-[var(--gold)]">Format HTML</strong> — le contenu est édité en HTML direct.</p>
        <p>Balises supportées : <code className="text-[var(--text-secondary)]">&lt;h2&gt; &lt;h3&gt; &lt;p&gt; &lt;ul&gt; &lt;li&gt; &lt;strong&gt; &lt;a&gt; &lt;hr&gt; &lt;em&gt;</code></p>
        <p>Ajoutez la classe <code className="text-[var(--text-secondary)]">class="note"</code> sur un <code className="text-[var(--text-secondary)]">&lt;em&gt;</code> pour un encadré avertissement.</p>
      </div>
    </div>
  )
}
