"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Shield, CheckCircle2, Clock, XCircle, FileText, AlertTriangle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

const STATUS_CONFIG = {
  PENDING:  { icon: Clock,         color: "var(--warning)",  label: "En attente de vérification" },
  APPROVED: { icon: CheckCircle2,  color: "var(--success)",  label: "Approuvé" },
  REJECTED: { icon: XCircle,       color: "var(--error)",    label: "Rejeté" },
  EXPIRED:  { icon: AlertTriangle, color: "var(--error)",    label: "Expiré" },
}

const DOC_TYPES = [
  { value: "ID_CARD",       label: "Carte d'identité" },
  { value: "PASSPORT",      label: "Passeport" },
  { value: "PROSTSCHG_REG", label: "Anmeldebescheinigung (ProstSchG §3)" },
  { value: "RESIDENCE",     label: "Justificatif de domicile" },
]

export default async function DashboardDokumentePage() {
  const h = await headers()
  const userId = h.get("x-user-id")
  if (!userId) redirect("/anmelden?next=/dashboard/dokumente")

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
    include: {
      kycDocuments: { orderBy: { submittedAt: "desc" } },
    },
  })

  const docs = profile?.kycDocuments ?? []
  const kycStatus = profile?.kycStatus ?? "PENDING"

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </Button>
        <div>
          <p className="label-luxury">Mon espace · Documents</p>
          <h1 className="text-2xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            Vérification KYC
          </h1>
        </div>
      </div>

      {/* KYC status banner */}
      <div
        className="rounded-[var(--r-xl)] p-5 border flex items-start gap-4"
        style={{
          borderColor: kycStatus === "APPROVED" ? "var(--success)" : kycStatus === "REJECTED" ? "var(--error)" : "var(--warning)",
          background: kycStatus === "APPROVED" ? "color-mix(in srgb, var(--success) 8%, transparent)" : kycStatus === "REJECTED" ? "color-mix(in srgb, var(--error) 8%, transparent)" : "color-mix(in srgb, var(--warning) 8%, transparent)",
        }}
      >
        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: kycStatus === "APPROVED" ? "var(--success)" : kycStatus === "REJECTED" ? "var(--error)" : "var(--warning)" }} />
        <div>
          <p className="text-sm font-medium text-[var(--pearl)] mb-1">
            {kycStatus === "APPROVED" ? "Vérification approuvée" : kycStatus === "REJECTED" ? "Vérification rejetée" : "Vérification en cours"}
          </p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {kycStatus === "APPROVED"
              ? "Votre identité est vérifiée. Votre profil peut être publié."
              : kycStatus === "REJECTED"
              ? "Vos documents ont été rejetés. Veuillez soumettre de nouveaux documents valides."
              : "Nos équipes vérifient vos documents. Ce processus prend généralement 24-48h."}
          </p>
        </div>
      </div>

      {/* Legal note */}
      <div className="card-luxury p-5 border border-[var(--border-gold)]/30 space-y-2">
        <p className="text-xs font-medium text-[var(--gold)] uppercase tracking-wide">Documents requis (ProstSchG)</p>
        <ul className="space-y-1.5">
          {DOC_TYPES.map((d) => (
            <li key={d.value} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]/40 flex-shrink-0" />
              {d.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Upload (coming soon) */}
      <div className="card-luxury p-6 space-y-4">
        <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">Soumettre un document</h2>
        <div className="rounded-[var(--r-xl)] border border-dashed border-[var(--border-gold)]/40 p-8 text-center">
          <FileText className="w-10 h-10 text-[var(--gold)]/30 mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)] mb-1">Upload sécurisé (chiffrement AES-256)</p>
          <p className="text-xs text-[var(--text-muted)] mb-4">PDF, JPG, PNG — max 10 Mo</p>
          <p className="text-xs text-[var(--text-muted)] italic">
            Pour soumettre vos documents, contactez notre support à{" "}
            <a href="mailto:kyc@6sexe-annonce.com" className="text-[var(--gold)] hover:underline">kyc@6sexe-annonce.com</a>
          </p>
        </div>
      </div>

      {/* Documents list */}
      {docs.length > 0 && (
        <div className="card-luxury p-6">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-4">
            Documents soumis ({docs.length})
          </h2>
          <div className="space-y-3">
            {docs.map((doc) => {
              const cfg = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
              const StatusIcon = cfg.icon
              return (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-[var(--r-lg)] bg-[var(--surface-3)] border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[var(--gold)]" />
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">
                        {DOC_TYPES.find((d) => d.value === doc.docType)?.label ?? doc.docType}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{formatDate(doc.submittedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ color: cfg.color }}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span className="text-xs">{cfg.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
