import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { LegalPageEditor } from "./legal-page-editor"

const KNOWN_SLUGS: Record<string, { titleDE: string; titleFR: string }> = {
  impressum:   { titleDE: "Impressum",                            titleFR: "Mentions légales" },
  agb:         { titleDE: "Allgemeine Geschäftsbedingungen",      titleFR: "Conditions Générales d'Utilisation" },
  datenschutz: { titleDE: "Datenschutzerklärung",                 titleFR: "Politique de Confidentialité" },
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function LegalEditPage({ params }: Props) {
  const { slug } = await params

  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  if (!KNOWN_SLUGS[slug]) notFound()
  const meta = KNOWN_SLUGS[slug]

  const page = await prisma.legalPage.findUnique({ where: { slug } })

  const initialData = {
    slug,
    titleDE:   page?.titleDE   ?? meta.titleDE,
    titleFR:   page?.titleFR   ?? meta.titleFR,
    contentDE: page?.contentDE ?? "",
    contentFR: page?.contentFR ?? "",
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/legal" className="text-[var(--text-muted)] hover:text-[var(--pearl)] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="label-luxury mb-1">Admin · Pages légales</p>
          <h1 className="text-2xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            {meta.titleFR}
            <span className="ml-3 text-base text-[var(--text-muted)]">/ {meta.titleDE}</span>
          </h1>
        </div>
      </div>

      <LegalPageEditor initialData={initialData} />
    </div>
  )
}
