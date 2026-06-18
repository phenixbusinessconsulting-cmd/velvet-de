import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Globe } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { CountrySortableList } from "./country-sortable-list"
import { AddCountryForm } from "./add-country-form"

export default async function AdminCountriesPage() {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  const countries = await prisma.country.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameDE: "asc" }],
    include: { _count: { select: { cities: true } } },
  })

  const activeCount = countries.filter((c) => c.isActive).length
  const totalCities = countries.reduce((s, c) => s + c._count.cities, 0)

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="label-luxury mb-2">Admin · Pays</p>
          <h1 className="text-3xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            Gestion des pays
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",   value: countries.length, color: "var(--text-secondary)" },
          { label: "Actifs",  value: activeCount,       color: "var(--success)" },
          { label: "Villes",  value: totalCities,       color: "var(--gold)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-luxury p-4">
            <Globe className="w-4 h-4 mb-2" style={{ color }} />
            <p className="text-2xl font-light" style={{ color, fontFamily: "var(--font-display)" }}>{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      <AddCountryForm />

      {/* Table */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <CountrySortableList initialCountries={countries} />
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        L&apos;ordre des pays (glisser-déposer) définit leur priorité d&apos;affichage. Désactiver un pays
        ne supprime pas ses villes mais le retire des listes publiques. La suppression n&apos;est possible
        que si aucune ville n&apos;y est rattachée.
      </p>
    </div>
  )
}
