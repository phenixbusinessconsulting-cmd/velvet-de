import type { Metadata } from "next"
import Link from "next/link"
import { Search } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProfileCard } from "@/components/features/directory/profile-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { getLocale, getMessages } from "@/lib/locale"
import type { PublicProfile } from "@/types"

export const metadata: Metadata = {
  title: "Verzeichnis / Répertoire",
  description: "Entdecken Sie verifizierte, professionelle Begleitpersonen.",
}

interface Props {
  searchParams: Promise<{ city?: string; type?: string; page?: string }>
}

export default async function DirectoryPage({ searchParams }: Props) {
  const params = await searchParams
  const cityFilter = params.city && params.city !== "all" ? params.city : undefined
  const page = Math.max(1, parseInt(params.page ?? "1"))
  const perPage = 20

  const locale = await getLocale()
  const t = await getMessages(locale)
  const d = t.directory

  const activeCities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameDE: "asc" }],
    select: { slug: true, nameDE: true, nameEN: true },
  })

  const cityNavItems = [
    { slug: "all", label: d.allCities },
    ...activeCities.map((c) => ({ slug: c.slug, label: c.nameDE })),
  ]

  const [profiles, total] = await Promise.all([
    prisma.professionalProfile.findMany({
      where: {
        status: "APPROVED",
        kycStatus: "APPROVED",
        ...(cityFilter && { city: { slug: cityFilter } }),
      },
      include: {
        city: true,
        photos: {
          where: { isApproved: true },
          orderBy: [{ isMain: "desc" }, { position: "asc" }],
          select: { id: true, cdnUrl: true, isMain: true, position: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.professionalProfile.count({
      where: {
        status: "APPROVED",
        kycStatus: "APPROVED",
        ...(cityFilter && { city: { slug: cityFilter } }),
      },
    }),
  ])

  const publicProfiles: PublicProfile[] = profiles.map((p) => ({
    id: p.id,
    slug: p.slug,
    displayName: p.displayName,
    age: p.age,
    city: { nameDE: p.city.nameDE, nameEN: p.city.nameEN, slug: p.city.slug, state: p.city.state },
    tagline: p.tagline,
    bio: p.bio,
    type: p.type,
    agencyName: p.agencyName,
    servicesTags: p.servicesTags,
    languages: p.languages,
    outcall: p.outcall,
    incall: p.incall,
    travel: p.travel,
    heightCm: p.heightCm ?? null,
    weightKg: p.weightKg ?? null,
    bustCm: p.bustCm ?? null,
    waistCm: p.waistCm ?? null,
    hipCm: p.hipCm ?? null,
    cupSize: p.cupSize ?? null,
    photos: p.photos,
    kycStatus: p.kycStatus,
    status: p.status,
    viewCount: p.viewCount,
    favoriteCount: p.favoriteCount,
    publishedAt: p.publishedAt?.toISOString() ?? null,
  }))

  const totalPages = Math.ceil(total / perPage)
  const currentCity = params.city ?? "all"

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="label-luxury mb-2">{d.label}</p>
              <h1 className="heading-luxury text-4xl sm:text-5xl text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
                {d.title}
              </h1>
              <p className="mt-3 text-[var(--text-secondary)]">
                {total} {total === 1 ? d.profilesCountSingular : d.profilesCountPlural}{" "}
              {cityFilter ? `${d.profilesCountCity} ${cityFilter}` : d.profilesCountDefault}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="surface" size="default">
                <Link href="/suche" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  {d.advancedSearch}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* City tabs */}
        <div className="border-b border-[var(--border)] mb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto pb-px scrollbar-none">
              {cityNavItems.map((city) => {
                const isActive = currentCity === city.slug
                return (
                  <Link
                    key={city.slug}
                    href={city.slug === "all" ? "/verzeichnis" : `/verzeichnis?city=${city.slug}`}
                    className={`flex-shrink-0 px-5 py-3 text-sm transition-colors duration-[220ms] border-b-2 ${
                      isActive ? "text-[var(--gold)] border-[var(--gold)]" : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {city.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>


        {/* Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {publicProfiles.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {publicProfiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Button asChild variant="surface" size="sm">
                      <Link href={`?${new URLSearchParams({ ...(cityFilter && { city: cityFilter }), page: String(page - 1) })}`}>
                        {d.prevPage}
                      </Link>
                    </Button>
                  )}
                  <span className="text-sm text-[var(--text-muted)] px-4">{page} / {totalPages}</span>
                  {page < totalPages && (
                    <Button asChild variant="surface" size="sm">
                      <Link href={`?${new URLSearchParams({ ...(cityFilter && { city: cityFilter }), page: String(page + 1) })}`}>
                        {d.nextPage}
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-full border border-[var(--border-gold)] flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✦</span>
              </div>
              <h3 className="text-2xl font-light text-[var(--pearl)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
                {d.emptyTitle}
              </h3>
              <p className="text-[var(--text-muted)] mb-8">{d.emptyDesc}</p>
              <Button asChild variant="gold-outline">
                <Link href="/verzeichnis">{d.emptyCta}</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
