import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { MapPin, Globe, Clock, CheckCircle2, Star, ChevronLeft, Car, Home, Eye } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PhotoLightbox, type MediaItem } from "@/components/features/public/photo-lightbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { getLocale, getMessages } from "@/lib/locale"

const DAY_LABELS_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
const DAY_LABELS_FR = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"]

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminProfilePreviewPage({ params }: Props) {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  const { id } = await params

  const locale = await getLocale()
  const t = await getMessages(locale)
  const p = t.profile

  const profile = await prisma.professionalProfile.findUnique({
    where: { id },
    include: {
      city: true,
      photos: {
        where: { isApproved: true, isPrivate: false },
        orderBy: [{ isMain: "desc" }, { position: "asc" }],
      },
      videos: {
        orderBy: { position: "asc" },
      },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      availability: { orderBy: { dayOfWeek: "asc" } },
      _count: { select: { reviews: { where: { status: "APPROVED" } } } },
    },
  })

  if (!profile) notFound()

  const dayLabels = locale === "fr" ? DAY_LABELS_FR : DAY_LABELS_DE
  const mainPhoto = profile.photos.find((ph) => ph.isMain) ?? profile.photos[0]
  const galleryPhotos = profile.bannerUrl
    ? profile.photos
    : profile.photos.filter((ph) => !ph.isMain)

  const firstPhotoUrl = profile.photos[0]?.cdnUrl
  const mediaItems: MediaItem[] = [
    ...galleryPhotos.map((ph) => ({ id: ph.id, url: ph.cdnUrl, type: "photo" as const })),
    ...profile.videos.map((v) => ({ id: v.id, url: v.cdnUrl, type: "video" as const, thumbnail: firstPhotoUrl })),
  ]
  const avgRating =
    profile.reviews.length > 0
      ? (profile.reviews.reduce((sum, r) => sum + r.rating, 0) / profile.reviews.length).toFixed(1)
      : null

  return (
    <>
      <Header />

      {/* Preview banner */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-2 text-xs font-medium"
        style={{ background: "var(--gold)", color: "var(--noir)" }}>
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5" />
          MODE PRÉVISUALISATION — statut : {profile.status}
        </div>
        <Link href={`/admin/profile/${id}`} className="underline underline-offset-2 hover:opacity-70 transition-opacity">
          ← Retour à l'admin
        </Link>
      </div>

      <main className="min-h-screen" style={{ paddingTop: "2rem" }}>
        {/* Back nav */}
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-4">
          <Link
            href={`/admin/profile/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour à l'admin
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">

            {/* ── Left column: Photos */}
            <div className="lg:col-span-2 space-y-4">
              <div className={`relative rounded-[var(--r-2xl)] overflow-hidden bg-[var(--surface-3)] ${profile.bannerUrl ? "aspect-[16/9]" : "aspect-[4/3] sm:aspect-[16/9]"}`}>
                {profile.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.bannerUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : mainPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mainPhoto.cdnUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl text-[var(--gold)] font-light" style={{ fontFamily: "var(--font-display)" }}>
                      {profile.displayName[0]}
                    </span>
                  </div>
                )}

                {profile.kycStatus === "APPROVED" && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 glass-gold rounded-full text-xs text-[var(--gold)] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {p.verifiedBadge}
                  </div>
                )}
              </div>

              {mediaItems.length > 0 && (
                <PhotoLightbox items={mediaItems} />
              )}

              {profile.bio && (
                <div className="card-luxury p-7">
                  <h2 className="text-xl font-light text-[var(--pearl)] mb-4" style={{ fontFamily: "var(--font-display)" }}>
                    {p.about}
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                </div>
              )}

              {profile.reviews.length > 0 && (
                <div className="card-luxury p-7">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
                      {p.reviews}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[var(--gold)] fill-[var(--gold)]" />
                      <span className="text-[var(--gold)] font-medium">{avgRating}</span>
                      <span className="text-[var(--text-muted)] text-sm">({profile._count.reviews})</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {profile.reviews.map((review) => (
                      <div key={review.id} className="pb-4 border-b border-[var(--border)] last:border-0 last:pb-0">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-[var(--gold)] fill-[var(--gold)]" />
                          ))}
                          {Array.from({ length: 5 - review.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-[var(--border-strong)]" />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-[var(--text-secondary)] italic">"{review.comment}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column */}
            <div className="space-y-5">
              <div className="card-luxury p-6">
                <h1 className="text-3xl font-light text-[var(--pearl)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  {profile.displayName}
                  <span className="text-[var(--text-muted)] text-2xl ml-2">{profile.age}</span>
                </h1>

                {profile.tagline && (
                  <p className="text-[var(--text-secondary)] italic text-sm mb-4">"{profile.tagline}"</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <MapPin className="w-4 h-4 text-[var(--gold)] flex-shrink-0" />
                    <span>{profile.city.nameDE}{profile.districtName && `, ${profile.districtName}`}</span>
                  </div>
                  {profile.languages.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Globe className="w-4 h-4 text-[var(--gold)] flex-shrink-0" />
                      <span>{profile.languages.join(", ").toUpperCase()}</span>
                    </div>
                  )}
                </div>

                {(profile.heightCm || profile.weightKg || profile.bustCm || profile.cupSize) && (
                  <div className="mt-5 pt-5 border-t border-[var(--border)]">
                    <div className="grid grid-cols-3 gap-3">
                      {profile.heightCm && (
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
                            {locale === "fr" ? "Taille" : "Größe"}
                          </p>
                          <p className="text-sm text-[var(--pearl)] font-light">{profile.heightCm} cm</p>
                        </div>
                      )}
                      {profile.weightKg && (
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
                            {locale === "fr" ? "Poids" : "Gewicht"}
                          </p>
                          <p className="text-sm text-[var(--pearl)] font-light">{profile.weightKg} kg</p>
                        </div>
                      )}
                      {profile.cupSize && (
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
                            {locale === "fr" ? "Bonnet" : "Körbchen"}
                          </p>
                          <p className="text-sm text-[var(--pearl)] font-light">{profile.cupSize}</p>
                        </div>
                      )}
                    </div>
                    {(profile.bustCm || profile.waistCm || profile.hipCm) && (
                      <div className="mt-3 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
                          {locale === "fr" ? "Mensurations" : "Maße"}
                        </p>
                        <p className="text-sm text-[var(--gold)] font-light tracking-wide">
                          {[profile.bustCm, profile.waistCm, profile.hipCm].filter(Boolean).join(" – ")}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-[var(--border)] flex flex-wrap gap-2">
                  {profile.incall && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <Home className="w-3.5 h-3.5 text-[var(--gold)]" />
                      {p.incall}
                    </div>
                  )}
                  {profile.outcall && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <Car className="w-3.5 h-3.5 text-[var(--gold)]" />
                      {p.outcall}
                    </div>
                  )}
                  {profile.travel && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <Globe className="w-3.5 h-3.5 text-[var(--gold)]" />
                      {p.travel}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[var(--r-xl)] p-6 text-center"
                style={{ background: "linear-gradient(135deg, var(--surface-2), var(--navy))", border: "1px solid var(--border-gold)" }}>
                <p className="label-luxury mb-3">{p.contact}</p>
                <p className="text-xs text-[var(--text-secondary)] mb-5 leading-relaxed">{p.contactDesc}</p>
                <Button variant="gold" size="lg" className="w-full opacity-50 cursor-not-allowed" disabled>
                  {p.contactButton}
                </Button>
                <p className="text-[10px] text-[var(--text-muted)] mt-3">{p.encryptedNote}</p>
              </div>

              {profile.availability.length > 0 && (
                <div className="card-luxury p-5">
                  <h3 className="text-base font-light text-[var(--pearl)] mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                    <Clock className="w-4 h-4 text-[var(--gold)]" />
                    {p.availability}
                  </h3>
                  <div className="space-y-2">
                    {profile.availability.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-muted)] w-8">{dayLabels[slot.dayOfWeek]}</span>
                        <span className="text-[var(--text-secondary)]">{slot.startTime} – {slot.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.servicesTags.length > 0 && (
                <div className="card-luxury p-5">
                  <h3 className="text-base font-light text-[var(--pearl)] mb-4" style={{ fontFamily: "var(--font-display)" }}>
                    {p.characteristics}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.servicesTags.map((tag) => (
                      <Badge key={tag} variant="surface">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
