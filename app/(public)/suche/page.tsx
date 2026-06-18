import type { Metadata } from "next"
import { Search } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProfileCard } from "@/components/features/directory/profile-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/prisma"
import { getLocale, getMessages } from "@/lib/locale"
import type { PublicProfile } from "@/types"

export const metadata: Metadata = {
  title: "Suche / Recherche",
  description: "Finden Sie genau das richtige Profil mit unserer erweiterten Suche.",
}

const LANGUAGES_DE = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "Englisch" },
  { code: "fr", label: "Französisch" },
  { code: "es", label: "Spanisch" },
  { code: "it", label: "Italienisch" },
  { code: "ru", label: "Russisch" },
  { code: "ar", label: "Arabisch" },
  { code: "zh", label: "Chinesisch" },
]

const LANGUAGES_FR = [
  { code: "de", label: "Allemand" },
  { code: "en", label: "Anglais" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Espagnol" },
  { code: "it", label: "Italien" },
  { code: "ru", label: "Russe" },
  { code: "ar", label: "Arabe" },
  { code: "zh", label: "Chinois" },
]

interface Props {
  searchParams: Promise<{
    city?: string
    lang?: string
    type?: string
    outcall?: string
    incall?: string
    travel?: string
    q?: string
  }>
}

export default async function SuchePage({ searchParams }: Props) {
  const params = await searchParams

  const locale = await getLocale()
  const t = await getMessages(locale)
  const s = t.search

  const [activeCities] = await Promise.all([
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { nameDE: "asc" }],
      select: { slug: true, nameDE: true },
    }),
  ])

  const languages = locale === "fr" ? LANGUAGES_FR : LANGUAGES_DE

  const where = {
    status: "APPROVED" as const,
    kycStatus: "APPROVED" as const,
    ...(params.city && { city: { slug: params.city } }),
    ...(params.lang && { languages: { has: params.lang } }),
    ...(params.outcall === "1" && { outcall: true }),
    ...(params.incall === "1" && { incall: true }),
    ...(params.travel === "1" && { travel: true }),
    ...(params.q && {
      OR: [
        { displayName: { contains: params.q, mode: "insensitive" as const } },
        { tagline: { contains: params.q, mode: "insensitive" as const } },
        { city: { nameDE: { contains: params.q, mode: "insensitive" as const } } },
      ],
    }),
  }

  const profiles = await prisma.professionalProfile.findMany({
    where,
    include: {
      city: true,
      photos: {
        where: { isApproved: true },
        orderBy: [{ isMain: "desc" }],
        take: 1,
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 40,
  })

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

  const hasFilters = !!(params.city || params.lang || params.outcall || params.incall || params.travel || params.q)

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-10">
            <p className="label-luxury mb-3">{s.label}</p>
            <h1 className="heading-luxury text-4xl text-[var(--pearl)] mb-10" style={{ fontFamily: "var(--font-display)" }}>
              {s.title}
            </h1>
          </div>

          {/* Filter form */}
          <form method="GET" className="card-luxury p-6 mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">{s.fieldQ}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <Input name="q" defaultValue={params.q} placeholder={s.fieldQPlaceholder} className="pl-10" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">{s.fieldCity}</label>
                <select
                  name="city"
                  defaultValue={params.city ?? ""}
                  className="w-full h-11 px-3 rounded-[var(--r-xl)] bg-[var(--surface-3)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/30 focus:border-[var(--border-gold)]"
                >
                  <option value="">{s.allCities}</option>
                  {activeCities.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.nameDE}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">{s.fieldLang}</label>
                <select
                  name="lang"
                  defaultValue={params.lang ?? ""}
                  className="w-full h-11 px-3 rounded-[var(--r-xl)] bg-[var(--surface-3)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/30 focus:border-[var(--border-gold)]"
                >
                  <option value="">{s.allLanguages}</option>
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-5">
              <span className="text-xs tracking-wide text-[var(--text-secondary)] uppercase">{s.availability}</span>
              {[
                { name: "outcall", label: s.outcall },
                { name: "incall",  label: s.incall },
                { name: "travel",  label: s.travel },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={name}
                    value="1"
                    defaultChecked={params[name as keyof typeof params] === "1"}
                    className="w-4 h-4 rounded-[var(--r-sm)] border-[var(--border-strong)] accent-[var(--gold)]"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                </label>
              ))}

              <div className="ml-auto flex gap-3">
                {hasFilters && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/suche">{s.resetFilters}</Link>
                  </Button>
                )}
                <Button type="submit" variant="gold" size="sm">
                  <Search className="w-4 h-4" />
                  {s.search}
                </Button>
              </div>
            </div>
          </form>

          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              {publicProfiles.length} {publicProfiles.length === 1 ? s.resultSingular : s.resultPlural}
            </p>
          </div>

          {publicProfiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {publicProfiles.map((p) => (
                <ProfileCard key={p.id} profile={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-4xl mb-5">◇</p>
              <h3 className="text-xl font-light text-[var(--pearl)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
                {s.noResults}
              </h3>
              <p className="text-sm text-[var(--text-muted)]">{s.noResultsHint}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
