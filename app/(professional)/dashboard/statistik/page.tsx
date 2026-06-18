import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, Heart, Star, TrendingUp } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

export default async function DashboardStatistikPage() {
  const h = await headers()
  const userId = h.get("x-user-id")
  if (!userId) redirect("/anmelden?next=/dashboard/statistik")

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
    include: {
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          reviews: { where: { status: "APPROVED" } },
          favorites: true,
        },
      },
    },
  })

  if (!profile) redirect("/dashboard")

  const avgRating = profile.reviews.length > 0
    ? profile.reviews.reduce((s, r) => s + r.rating, 0) / profile.reviews.length
    : null

  const stats = [
    { label: "Vues du profil",  value: profile.viewCount,         icon: Eye,       color: "var(--gold)" },
    { label: "Favoris",         value: profile._count.favorites,  icon: Heart,     color: "var(--error)" },
    { label: "Avis approuvés",  value: profile._count.reviews,    icon: Star,      color: "var(--gold)" },
    { label: "Note moyenne",    value: avgRating ? avgRating.toFixed(1) + " / 5" : "—", icon: TrendingUp, color: "var(--success)" },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </Button>
        <div>
          <p className="label-luxury">Mon espace · Statistiques</p>
          <h1 className="text-2xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            Mes statistiques
          </h1>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-luxury p-5">
            <Icon className="w-5 h-5 mb-3" style={{ color }} />
            <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
            <p className="text-2xl font-light" style={{ color, fontFamily: "var(--font-display)" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Reviews */}
      <div className="card-luxury p-6">
        <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-4">
          Derniers avis
        </h2>
        {profile.reviews.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">Aucun avis pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {profile.reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-[var(--r-lg)] bg-[var(--surface-3)] border border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--gold)]">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className="text-xs text-[var(--text-muted)]">{formatDate(r.createdAt)}</span>
                </div>
                {r.comment && (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Les statistiques détaillées (évolution journalière, sources de trafic) seront disponibles prochainement.
      </p>
    </div>
  )
}
