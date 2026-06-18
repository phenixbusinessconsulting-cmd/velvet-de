import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { MapPin } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { CitySortableList } from "./city-sortable-list"
import { AddCityForm } from "./add-city-form"

export default async function AdminCitiesPage() {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  const cities = await prisma.city.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameDE: "asc" }],
    include: {
      _count: {
        select: { profiles: { where: { status: "APPROVED", kycStatus: "APPROVED" } } },
      },
    },
  })

  const landingCount = cities.filter((c) => c.showOnLanding).length
  const activeCount  = cities.filter((c) => c.isActive).length
  const totalProfiles = cities.reduce((s, c) => s + c._count.profiles, 0)

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="label-luxury mb-2">Admin · Villes</p>
          <h1 className="text-3xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            Gestion des villes
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",          value: cities.length,  color: "var(--text-secondary)" },
          { label: "Actives",        value: activeCount,    color: "var(--success)" },
          { label: "Page d'accueil", value: landingCount,   color: "var(--gold)" },
          { label: "Profils actifs", value: totalProfiles,  color: "var(--gold)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-luxury p-4">
            <MapPin className="w-4 h-4 mb-2" style={{ color }} />
            <p className="text-2xl font-light" style={{ color, fontFamily: "var(--font-display)" }}>{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      <AddCityForm />

      {/* Table */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <CitySortableList initialCities={cities} />
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        Les villes marquées <span className="text-[var(--gold)]">◆ Accueil</span> apparaissent dans la section villes de la page d'accueil.
        Le badge affiche le nombre de profils approuvés en temps réel.
      </p>
    </div>
  )
}
