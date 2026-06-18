import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Flag, Eye } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

const PRIORITY_STYLE: Record<string, string> = {
  CRITICAL: "text-[var(--error)] bg-[var(--error)]/10",
  HIGH:     "text-[var(--warning)] bg-[var(--warning)]/10",
  NORMAL:   "text-[var(--text-secondary)] bg-[var(--surface-4)]",
  LOW:      "text-[var(--text-muted)] bg-[var(--surface-3)]",
}

const STATUS_STYLE: Record<string, string> = {
  OPEN:          "text-[var(--warning)] bg-[var(--warning)]/10",
  INVESTIGATING: "text-[var(--info)] bg-[var(--info)]/10",
  ESCALATED:     "text-[var(--error)] bg-[var(--error)]/10",
  RESOLVED:      "text-[var(--success)] bg-[var(--success)]/10",
  DISMISSED:     "text-[var(--text-muted)] bg-[var(--surface-3)]",
}

const STATUS_FILTERS = [
  { value: "",             label: "Tous" },
  { value: "OPEN",         label: "Ouverts" },
  { value: "INVESTIGATING",label: "En cours" },
  { value: "RESOLVED",     label: "Résolus" },
  { value: "DISMISSED",    label: "Rejetés" },
]

interface Props {
  searchParams: Promise<{ status?: string; priority?: string; page?: string }>
}

export default async function AdminReportsPage({ searchParams }: Props) {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  const params = await searchParams
  const statusFilter = params.status ?? ""
  const priorityFilter = params.priority ?? ""
  const page = Math.max(1, parseInt(params.page ?? "1"))
  const perPage = 25

  const where = {
    ...(statusFilter && { status: statusFilter as never }),
    ...(priorityFilter && { priority: priorityFilter as never }),
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        profile: { select: { displayName: true, slug: true, id: true } },
        reporter: { select: { email: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.report.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-luxury mb-2">Admin · Modération</p>
          <h1 className="text-3xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            Signalements
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{total} signalement{total > 1 ? "s" : ""}</p>
        </div>
        <Flag className="w-8 h-8 text-[var(--gold)]/30" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/meldungen?status=${f.value}` : "/admin/meldungen"}
            className={`px-3 py-1.5 rounded-[var(--r-lg)] text-xs transition-colors border ${
              statusFilter === f.value
                ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold-muted)]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {f.label}
          </Link>
        ))}
        <div className="w-px h-6 bg-[var(--border)] self-center mx-1" />
        {["CRITICAL", "HIGH", "NORMAL"].map((p) => (
          <Link
            key={p}
            href={`/admin/meldungen?priority=${p}`}
            className={`px-3 py-1.5 rounded-[var(--r-lg)] text-xs transition-colors border ${
              priorityFilter === p
                ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold-muted)]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {p}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Profil", "Raison", "Priorité", "Statut", "Signalé par", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] tracking-widest uppercase text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
                    Aucun signalement
                  </td>
                </tr>
              )}
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-3)] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm text-[var(--text-primary)] font-medium">{r.profile.displayName}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                    {r.reason.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${PRIORITY_STYLE[r.priority] ?? ""}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLE[r.status] ?? ""}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                    {r.reporter.email.substring(0, 20)}…
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button asChild size="icon-sm" variant="surface">
                      <Link href={`/admin/profile/${r.profile.id}`}>
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
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
