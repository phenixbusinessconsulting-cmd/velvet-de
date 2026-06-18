import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Users, Shield, Flag, Clock, CheckCircle2, XCircle,
  TrendingUp, AlertTriangle, Eye, BarChart2
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PROFILE_STATUS_LABELS, formatDate } from "@/lib/utils"
import { getLocale, getMessages } from "@/lib/locale"
import type { AdminStats } from "@/types"

export default async function AdminDashboard() {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")

  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) {
    redirect("/")
  }

  const locale = await getLocale()
  const t = await getMessages(locale)
  const a = t.admin

  const [
    totalProfiles,
    pendingReview,
    approvedCount,
    suspendedCount,
    pendingKyc,
    openReports,
    criticalReports,
    newUsersToday,
    newUsersWeek,
    pendingProfiles,
    recentReports,
  ] = await Promise.all([
    prisma.professionalProfile.count(),
    prisma.professionalProfile.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.professionalProfile.count({ where: { status: "APPROVED" } }),
    prisma.professionalProfile.count({ where: { status: "SUSPENDED" } }),
    prisma.professionalProfile.count({ where: { kycStatus: "UNDER_REVIEW" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.report.count({ where: { status: "OPEN", priority: "CRITICAL" } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    prisma.professionalProfile.findMany({
      where: { status: "PENDING_REVIEW" },
      include: { city: true },
      orderBy: { createdAt: "asc" },
      take: 10,
    }),
    prisma.report.findMany({
      where: { status: "OPEN" },
      include: { profile: { select: { displayName: true, slug: true } } },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: 10,
    }),
  ])

  const stats: AdminStats = {
    totalProfiles, pendingReview, approved: approvedCount,
    suspended: suspendedCount, pendingKyc, openReports,
    criticalReports, newUsersToday, newUsersWeek,
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <p className="label-luxury mb-2">{a.label}</p>
        <h1
          className="text-3xl font-light text-[var(--pearl)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {a.title}
        </h1>
      </div>

      {/* Critical alerts */}
      {criticalReports > 0 && (
        <div className="rounded-[var(--r-xl)] p-4 border border-[var(--error)]/30 bg-[var(--error)]/5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--error)] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--pearl)]">
              {criticalReports} {criticalReports > 1 ? a.criticalAlertPlural : a.criticalAlert}
            </p>
            <p className="text-xs text-[var(--text-muted)]">{a.criticalDesc}</p>
          </div>
          <Button asChild variant="destructive" size="sm">
            <Link href="/admin/meldungen?priority=CRITICAL">{a.view}</Link>
          </Button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[
          { label: a.totalProfiles,    value: stats.totalProfiles, icon: Users,         color: "var(--text-secondary)" },
          { label: a.pendingReview,    value: stats.pendingReview, icon: Clock,         color: "var(--warning)" },
          { label: a.approved,         value: stats.approved,      icon: CheckCircle2,  color: "var(--success)" },
          { label: a.suspended,        value: stats.suspended,     icon: XCircle,       color: "var(--error)" },
          { label: a.kycUnderReview,   value: stats.pendingKyc,    icon: Shield,        color: "var(--info)" },
          { label: a.openReports,      value: stats.openReports,   icon: Flag,          color: stats.openReports > 0 ? "var(--warning)" : "var(--text-muted)" },
          { label: a.newUsersToday,    value: stats.newUsersToday, icon: TrendingUp,    color: "var(--gold)" },
          { label: a.newUsersWeek,     value: stats.newUsersWeek,  icon: BarChart2,     color: "var(--gold)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-luxury p-4">
            <Icon className="w-4 h-4 mb-3" style={{ color }} />
            <p className="text-2xl font-light mb-1" style={{ color, fontFamily: "var(--font-display)" }}>
              {value}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pending profiles */}
        <div className="card-luxury p-5">
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-lg font-light text-[var(--pearl)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {a.queueTitle}
            </h2>
            <Button asChild variant="gold-outline" size="sm">
              <Link href="/admin/profile?status=PENDING_REVIEW">{a.viewAll}</Link>
            </Button>
          </div>

          {pendingProfiles.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-6">
              {a.noQueue}
            </p>
          ) : (
            <div className="space-y-2">
              {pendingProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-3 rounded-[var(--r-lg)] bg-[var(--surface-3)] border border-[var(--border)] hover:border-[var(--border-gold)] transition-colors"
                >
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">{profile.displayName}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {profile.city.nameDE} · {formatDate(profile.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" size="sm">{a.waiting}</Badge>
                    <Button asChild variant="gold" size="icon-sm">
                      <Link href={`/admin/profile/${profile.id}`}>
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent reports */}
        <div className="card-luxury p-5">
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-lg font-light text-[var(--pearl)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {a.reportsTitle}
            </h2>
            <Button asChild variant="gold-outline" size="sm">
              <Link href="/admin/meldungen">{a.viewAll}</Link>
            </Button>
          </div>

          {recentReports.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-6">
              {a.noReports}
            </p>
          ) : (
            <div className="space-y-2">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-[var(--r-lg)] bg-[var(--surface-3)] border border-[var(--border)] hover:border-[var(--border-gold)] transition-colors"
                >
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      {report.profile.displayName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {report.reason} · {formatDate(report.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={report.priority === "CRITICAL" ? "error" : report.priority === "HIGH" ? "warning" : "muted"}
                    size="sm"
                  >
                    {report.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: "/admin/profile",          label: t.adminNav.profiles,       icon: Users },
          { href: "/admin/meldungen",        label: t.adminNav.reports,        icon: Flag },
          { href: "/admin/verifizierungen",  label: t.adminNav.verifications,  icon: Shield },
          { href: "/admin/logs",             label: t.adminNav.auditLogs,      icon: BarChart2 },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="card-luxury p-5 flex flex-col items-center gap-3 hover:border-[var(--border-gold)] transition-all group text-center"
          >
            <Icon className="w-6 h-6 text-[var(--gold)] group-hover:scale-110 transition-transform duration-[220ms]" />
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--pearl)] transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
