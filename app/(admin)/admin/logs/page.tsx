import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ScrollText } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

const ACTION_COLOR: Record<string, string> = {
  LOGIN:           "var(--success)",
  LOGOUT:          "var(--text-muted)",
  PROFILE_APPROVE: "var(--success)",
  PROFILE_REJECT:  "var(--error)",
  PROFILE_SUSPEND: "var(--warning)",
  KYC_APPROVE:     "var(--success)",
  KYC_REJECT:      "var(--error)",
  REPORT_RESOLVE:  "var(--success)",
  REPORT_DISMISS:  "var(--text-muted)",
  ADMIN_ACCESS:    "var(--gold)",
  DATA_EXPORT:     "var(--warning)",
  ACCOUNT_DELETE:  "var(--error)",
}

interface Props {
  searchParams: Promise<{ page?: string; action?: string }>
}

export default async function AdminLogsPage({ searchParams }: Props) {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? "1"))
  const actionFilter = params.action ?? ""
  const perPage = 50

  const where = actionFilter ? { action: actionFilter as never } : {}

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.auditLog.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  const actionCounts = await prisma.auditLog.groupBy({
    by: ["action"],
    _count: true,
    orderBy: { _count: { action: "desc" } },
    take: 8,
  })

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-luxury mb-2">Admin · DSGVO Art. 30</p>
          <h1 className="text-3xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            Journal d&apos;audit
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{total} entrée{total > 1 ? "s" : ""}</p>
        </div>
        <ScrollText className="w-8 h-8 text-[var(--gold)]/30" />
      </div>

      {/* Action stats */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/logs"
          className={`px-3 py-1.5 rounded-[var(--r-lg)] text-xs transition-colors border ${
            !actionFilter ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold-muted)]" : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Toutes actions
        </Link>
        {actionCounts.map((ac) => (
          <Link
            key={ac.action}
            href={`/admin/logs?action=${ac.action}`}
            className={`px-3 py-1.5 rounded-[var(--r-lg)] text-xs transition-colors border ${
              actionFilter === ac.action ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold-muted)]" : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {ac.action} <span className="text-[var(--text-muted)]">({ac._count})</span>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Action", "Utilisateur", "Entité", "IP", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] tracking-widest uppercase text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
                    Aucun log
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-3)] transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{
                        color: ACTION_COLOR[log.action] ?? "var(--text-secondary)",
                        background: `${ACTION_COLOR[log.action] ?? "var(--text-secondary)"}18`,
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                    {log.user?.email?.substring(0, 28) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                    {log.entity ? `${log.entity}${log.entityId ? ` #${log.entityId.substring(0, 8)}` : ""}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)] font-mono">
                    {log.ipAddress ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                    {formatDate(log.createdAt)}
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
              <Link href={`?${new URLSearchParams({ ...(actionFilter && { action: actionFilter }), page: String(page - 1) })}`}>Précédent</Link>
            </Button>
          )}
          <span className="text-sm text-[var(--text-muted)] px-4">{page} / {totalPages}</span>
          {page < totalPages && (
            <Button asChild variant="surface" size="sm">
              <Link href={`?${new URLSearchParams({ ...(actionFilter && { action: actionFilter }), page: String(page + 1) })}`}>Suivant</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
