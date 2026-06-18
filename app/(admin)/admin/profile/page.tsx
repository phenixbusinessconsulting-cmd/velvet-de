import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Eye, Users, Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PROFILE_STATUS_LABELS, KYC_STATUS_LABELS, formatDate } from "@/lib/utils"
import { getLocale } from "@/lib/locale"

const STATUS_FILTERS = [
  { value: "",               label: "Tous" },
  { value: "PENDING_REVIEW", label: "En attente" },
  { value: "APPROVED",       label: "Approuvés" },
  { value: "SUSPENDED",      label: "Suspendus" },
  { value: "REJECTED",       label: "Rejetés" },
  { value: "DRAFT",          label: "Brouillons" },
]

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminProfilesPage({ searchParams }: Props) {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  const locale = await getLocale()
  const params = await searchParams
  const statusFilter = params.status ?? ""
  const page = Math.max(1, parseInt(params.page ?? "1"))
  const perPage = 25

  const where = statusFilter ? { status: statusFilter as never } : {}

  const [profiles, total] = await Promise.all([
    prisma.professionalProfile.findMany({
      where,
      include: { city: true, _count: { select: { photos: true, kycDocuments: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.professionalProfile.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-luxury mb-2">Admin · Gestion</p>
          <h1 className="text-3xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            Profils
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{total} profil{total > 1 ? "s" : ""}</p>
        </div>
        <Button asChild variant="gold" size="sm">
          <Link href="/admin/profile/new">
            <Plus className="w-4 h-4 mr-1.5" />
            Créer un profil
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/profile?status=${f.value}` : "/admin/profile"}
            className={`px-3 py-1.5 rounded-[var(--r-lg)] text-xs transition-colors border ${
              statusFilter === f.value
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
                {["Nom", "Ville", "Type", "Statut", "KYC", "Photos", "Créé", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] tracking-widest uppercase text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
                    Aucun profil trouvé
                  </td>
                </tr>
              )}
              {profiles.map((p) => {
                const sl = PROFILE_STATUS_LABELS[p.status]
                const kl = KYC_STATUS_LABELS[p.kycStatus]
                const slLabel = locale === "fr" ? sl.fr : sl.de
                const klLabel = locale === "fr" ? kl.fr : kl.de
                return (
                  <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-3)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-[var(--text-primary)] font-medium">{p.displayName}</p>
                      <p className="text-xs text-[var(--text-muted)] font-mono">{p.age} ans</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{p.city.nameDE}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[var(--text-muted)]">
                        {p.type === "AGENCY" ? "Agence" : "Indépendant"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ color: sl.color, background: `${sl.color}18` }}>
                        {slLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ color: kl.color, background: `${kl.color}18` }}>
                        {klLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{p._count.photos}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(p.createdAt)}</td>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button asChild variant="surface" size="sm">
              <Link href={`?${new URLSearchParams({ ...(statusFilter && { status: statusFilter }), page: String(page - 1) })}`}>
                Précédent
              </Link>
            </Button>
          )}
          <span className="text-sm text-[var(--text-muted)] px-4">{page} / {totalPages}</span>
          {page < totalPages && (
            <Button asChild variant="surface" size="sm">
              <Link href={`?${new URLSearchParams({ ...(statusFilter && { status: statusFilter }), page: String(page + 1) })}`}>
                Suivant
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
