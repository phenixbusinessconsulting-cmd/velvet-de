import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Camera, FileText, BarChart2,
  CheckCircle2, AlertTriangle, Eye, Heart
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PROFILE_STATUS_LABELS, KYC_STATUS_LABELS } from "@/lib/utils"
import { getLocale, getMessages } from "@/lib/locale"

export default async function ProfessionalDashboard() {
  const headersList = await headers()
  const userId = headersList.get("x-user-id")
  if (!userId) redirect("/anmelden")

  const locale = await getLocale()
  const t = await getMessages(locale)
  const d = t.dashboard

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      professionalProfile: {
        include: {
          photos: { where: { isApproved: true }, orderBy: [{ isMain: "desc" }], take: 5 },
          city: true,
          _count: { select: { reviews: { where: { status: "APPROVED" } } } },
        },
      },
    },
  })

  if (!user) redirect("/anmelden?next=/dashboard")

  const profile = user.professionalProfile
  const statusLabel = profile ? PROFILE_STATUS_LABELS[profile.status] : null
  const kycLabel    = profile ? KYC_STATUS_LABELS[profile.kycStatus] : null

  return (
    <div className="min-h-screen bg-[var(--noir)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="label-luxury mb-2">{d.myArea}</p>
            <h1
              className="text-3xl font-light text-[var(--pearl)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {profile?.displayName ?? d.title}
            </h1>
          </div>
          {profile && (
            <Button asChild variant="gold-outline" size="sm">
              <Link href={`/profil/${profile.slug}`}>{d.viewProfileBtn}</Link>
            </Button>
          )}
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: d.statusLabel,
              value: statusLabel?.de ?? d.noProfile,
              color: statusLabel?.color ?? "var(--text-muted)",
              icon: LayoutDashboard,
            },
            {
              label: d.verificationLabel,
              value: kycLabel?.de ?? d.pending,
              color: kycLabel?.color ?? "var(--text-muted)",
              icon: CheckCircle2,
            },
            {
              label: d.viewsLabel,
              value: String(profile?.viewCount ?? 0),
              color: "var(--gold)",
              icon: Eye,
            },
            {
              label: d.favoritesLabel,
              value: String(profile?.favoriteCount ?? 0),
              color: "var(--gold)",
              icon: Heart,
            },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="card-luxury p-5">
              <Icon className="w-5 h-5 mb-3" style={{ color }} />
              <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
              <p className="text-lg font-light" style={{ color, fontFamily: "var(--font-display)" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Profile actions */}
          <div className="lg:col-span-2 space-y-5">

            {/* KYC Status */}
            {profile && profile.kycStatus !== "APPROVED" && (
              <div className="rounded-[var(--r-xl)] p-5 border border-[var(--warning)]/25 bg-[var(--warning)]/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--pearl)] mb-1">
                      {d.kycRequired}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                      {d.kycRequiredDesc} {d.kycDocRequired}
                    </p>
                    <Button asChild variant="gold" size="sm">
                      <Link href="/dashboard/dokumente">{d.uploadDocuments}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Profile not created yet */}
            {!profile && (
              <div className="card-luxury p-8 text-center">
                <div className="w-16 h-16 rounded-full border border-[var(--border-gold)] flex items-center justify-center mx-auto mb-5">
                  <LayoutDashboard className="w-7 h-7 text-[var(--gold)]" />
                </div>
                <h2
                  className="text-xl font-light text-[var(--pearl)] mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {d.createProfileTitle}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto leading-relaxed">
                  {d.createProfileDesc}
                </p>
                <Button asChild variant="gold" size="lg">
                  <Link href="/dashboard/profil">{d.createProfileBtn}</Link>
                </Button>
              </div>
            )}

            {/* Quick actions */}
            {profile && (
              <div className="card-luxury p-5">
                <h2
                  className="text-lg font-light text-[var(--pearl)] mb-5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {d.quickActions}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { href: "/dashboard/profil",    icon: FileText,  label: d.editProfileLabel },
                    { href: "/dashboard/fotos",     icon: Camera,    label: d.managePhotosLabel },
                    { href: "/dashboard/statistik", icon: BarChart2, label: d.statisticsLabel },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex flex-col items-center gap-2 p-4 rounded-[var(--r-xl)] border border-[var(--border)] hover:border-[var(--border-gold)] hover:bg-[var(--gold-muted)] transition-all duration-[220ms] text-center"
                    >
                      <Icon className="w-5 h-5 text-[var(--gold)]" />
                      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent reviews */}
            {profile && profile._count.reviews > 0 && (
              <div className="card-luxury p-5">
                <h2
                  className="text-lg font-light text-[var(--pearl)] mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {d.recentReviews}
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {profile._count.reviews} {d.approvedReviewsCount}
                </p>
              </div>
            )}
          </div>

          {/* Right: Checklist */}
          <div className="space-y-5">
            <div className="card-luxury p-5">
              <h3
                className="text-base font-light text-[var(--pearl)] mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {d.checklist}
              </h3>
              <div className="space-y-3">
                {[
                  { label: d.checklistItems[0], done: true },
                  { label: d.checklistItems[1], done: !!profile },
                  { label: d.checklistItems[2], done: !!(profile?.photos.some((p) => p.isMain)) },
                  { label: d.checklistItems[3], done: profile?.kycStatus !== "PENDING" },
                  { label: d.checklistItems[4], done: profile?.kycStatus === "APPROVED" },
                  { label: d.checklistItems[5], done: profile?.status === "APPROVED" },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      done ? "bg-[var(--success)]" : "border border-[var(--border-strong)]"
                    }`}>
                      {done && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                          <path d="M2 5L4.5 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs ${done ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-luxury p-5 space-y-3">
              <h3
                className="text-base font-light text-[var(--pearl)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {d.helpTitle}
              </h3>
              <Link href="/faq" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                → {d.faqLink}
              </Link>
              <Link href="/kontakt" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                → {d.supportLink}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
