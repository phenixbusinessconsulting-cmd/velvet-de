import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Shield, Eye } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { KYC_STATUS_LABELS, formatDate } from "@/lib/utils"

const KYC_FILTERS = [
  { value: "",                   label: "Tous" },
  { value: "UNDER_REVIEW",       label: "En révision" },
  { value: "DOCUMENTS_REQUESTED",label: "Docs demandés" },
  { value: "PENDING",            label: "En attente" },
  { value: "APPROVED",           label: "Approuvés" },
  { value: "REJECTED",           label: "Rejetés" },
]

interface Props {
  searchParams: Promise<{ kyc?: string; page?: string }>
}

export default async function AdminVerificationsPage({ searchParams }: Props) {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  const params = await searchParams
  const kycFilter = params.kyc ?? ""
  const page = Math.max(1, parseInt(params.page ?? "1"))
  const perPage = 25

  const where = kycFilter ? { kycStatus: kycFilter as never } : {}

  const [profiles, total] = await Promise.all([
    prisma.professionalProfile.findMany({
      where,
      include: {
        city: true,
        _count: { select: { kycDocuments: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.professionalProfile.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  const counts = await prisma.professionalProfile.groupBy({
    by: ["kycStatus"],
    _count: true,
  })
  const countMap = Object.fromEntries(counts.map((c) => [c.kycStatus, c._count]))

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-luxury mb-2">Admin · KYC</p>
          <h1 className="text-3xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            Vérifications KYC
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{total} profil{total > 1 ? "s" : ""}</p>
        </div>
        <Shield className="w-8 h-8 text-[var(--gold)]/30" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(["PENDING","DOCUMENTS_REQUESTED","UNDER_REVIEW","APPROVED","REJECTED","EXPIRED"] as const).map((s) => {
          const kl = KYC_STATUS_LABELS[s]
          return (
            <Link
              key={s}
              href={`/admin/verifizierungen?kyc=${s}`}
              className={`card-luxury p-3 text-center hover:border-[var(--border-gold)] transition-colors ${kycFilter === s ? "border-[var(--border-gold)]" : ""}`}
            >
              <p className="text-xl font-light" style={{ color: kl.color, fontFamily: "var(--font-display)" }}>
                {countMap[s] ?? 0}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{kl.de}</p>
            </Link>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {KYC_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/verifizierungen?kyc=${f.value}` : "/admin/verifizierungen"}
            className={`px-3 py-1.5 rounded-[var(--r-lg)] text-xs transition-colors border ${
              kycFilter === f.value
                ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold-muted)]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Nom", "Ville", "Statut KYC", "Documents", "Mis à jour", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] tracking-widest uppercase text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
                    Aucun profil
                  </td>
                </tr>
              )}
              {profiles.map((p) => {
                const kl = KYC_STATUS_LABELS[p.kycStatus]
                return (
                  <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-3)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-[var(--text-primary)] font-medium">{p.displayName}</p>
                      <p className="text-xs text-[var(--text-muted)]">{p.age} ans</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{p.city.nameDE}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ color: kl.color, background: `${kl.color}18` }}>
                        {kl.de}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{p._count.kycDocuments}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(p.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <Button asChild size="icon-sm" variant="surface">
                        <Link href={`/admin/profile/${p.id}`}>
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button asChild variant="surface" size="sm">
              <Link href={`?${new URLSearchParams({ ...(kycFilter && { kyc: kycFilter }), page: String(page - 1) })}`}>Précédent</Link>
            </Button>
          )}
          <span className="text-sm text-[var(--text-muted)] px-4">{page} / {totalPages}</span>
          {page < totalPages && (
            <Button asChild variant="surface" size="sm">
              <Link href={`?${new URLSearchParams({ ...(kycFilter && { kyc: kycFilter }), page: String(page + 1) })}`}>Suivant</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
