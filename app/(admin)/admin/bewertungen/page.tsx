import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { BarChart2, CheckCircle2, XCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

const STATUS_FILTERS = [
  { value: "",         label: "Tous" },
  { value: "PENDING",  label: "En attente" },
  { value: "APPROVED", label: "Approuvés" },
  { value: "REJECTED", label: "Rejetés" },
  { value: "FLAGGED",  label: "Signalés" },
]

const STATUS_STYLE: Record<string, string> = {
  PENDING:  "text-[var(--warning)] bg-[var(--warning)]/10",
  APPROVED: "text-[var(--success)] bg-[var(--success)]/10",
  REJECTED: "text-[var(--error)] bg-[var(--error)]/10",
  FLAGGED:  "text-[var(--error)] bg-[var(--error)]/10",
}

async function moderateReview(id: string, status: "APPROVED" | "REJECTED") {
  "use server"
  const h = await headers()
  const role = h.get("x-user-role") ?? ""
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role)) throw new Error("Unauthorized")
  await prisma.review.update({ where: { id }, data: { status, moderatedAt: new Date() } })
  revalidatePath("/admin/bewertungen")
}

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminReviewsPage({ searchParams }: Props) {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  const params = await searchParams
  const statusFilter = params.status ?? ""
  const page = Math.max(1, parseInt(params.page ?? "1"))
  const perPage = 25

  const where = statusFilter ? { status: statusFilter as never } : {}

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { profile: { select: { displayName: true, id: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.review.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-luxury mb-2">Admin · Modération</p>
          <h1 className="text-3xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            Avis & Évaluations
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{total} avis</p>
        </div>
        <BarChart2 className="w-8 h-8 text-[var(--gold)]/30" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/bewertungen?status=${f.value}` : "/admin/bewertungen"}
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
                {["Profil", "Note", "Commentaire", "Statut", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] tracking-widest uppercase text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
                    Aucun avis
                  </td>
                </tr>
              )}
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-3)] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/profile/${r.profile.id}`} className="text-sm text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors font-medium">
                      {r.profile.displayName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[var(--gold)]">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {r.comment ?? <span className="text-[var(--text-muted)] italic">Sans commentaire</span>}
                    </p>
                    {r.isFlagged && r.flagReason && (
                      <p className="text-[10px] text-[var(--error)] mt-0.5">⚑ {r.flagReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLE[r.status] ?? ""}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {r.status !== "APPROVED" && (
                        <form action={async () => { "use server"; await moderateReview(r.id, "APPROVED") }}>
                          <button type="submit" className="p-1.5 rounded text-[var(--success)] hover:bg-[var(--success)]/10 transition-colors" title="Approuver">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      )}
                      {r.status !== "REJECTED" && (
                        <form action={async () => { "use server"; await moderateReview(r.id, "REJECTED") }}>
                          <button type="submit" className="p-1.5 rounded text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors" title="Rejeter">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button asChild variant="surface" size="sm">
              <Link href={`?${new URLSearchParams({ ...(statusFilter && { status: statusFilter }), page: String(page - 1) })}`}>Précédent</Link>
            </Button>
          )}
          <span className="text-sm text-[var(--text-muted)] px-4">{page} / {totalPages}</span>
          {page < totalPages && (
            <Button asChild variant="surface" size="sm">
              <Link href={`?${new URLSearchParams({ ...(statusFilter && { status: statusFilter }), page: String(page + 1) })}`}>Suivant</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

