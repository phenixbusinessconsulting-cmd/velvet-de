import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { prisma } from "@/lib/prisma"
import { getLocale } from "@/lib/locale"

export const metadata: Metadata = {
  title: "AGB / CGU",
  description: "Allgemeine Geschäftsbedingungen / Conditions Générales d'Utilisation.",
}

export default async function AGBPage() {
  const [page, locale] = await Promise.all([
    prisma.legalPage.findUnique({ where: { slug: "agb" } }),
    getLocale(),
  ])

  const isFr   = locale === "fr"
  const title   = isFr ? (page?.titleFR   || "Conditions Générales d'Utilisation") : (page?.titleDE   || "Allgemeine Geschäftsbedingungen")
  const label   = isFr ? "Légal"                                                     : "Rechtliches"
  const content = isFr ? (page?.contentFR ?? "")                                    : (page?.contentDE ?? "")

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="py-10">
            <p className="label-luxury mb-3">{label}</p>
            <h1 className="heading-luxury text-4xl text-[var(--pearl)] mb-12" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h1>
            <div className="card-luxury p-8">
              {content.trim() ? (
                <div className="legal-content" dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <EmptyContent isFr={isFr} />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function EmptyContent({ isFr }: { isFr: boolean }) {
  return (
    <div className="text-center py-12 text-[var(--text-muted)]">
      <p className="text-3xl mb-4">📄</p>
      <p className="text-sm">
        {isFr
          ? "Ce contenu est en cours de rédaction."
          : "Dieser Inhalt wird derzeit verfasst."}
      </p>
    </div>
  )
}
