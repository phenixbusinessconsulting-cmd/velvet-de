import { notFound } from "next/navigation"
import Link from "next/link"
import { Lock, ChevronLeft } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PhotoLightbox, type MediaItem } from "@/components/features/public/photo-lightbox"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{ token: string }>
}

export default async function PrivateGalleryPage({ params }: Props) {
  const { token } = await params

  const access = await prisma.privateGalleryAccess.findUnique({
    where: { token },
    include: {
      profile: {
        include: {
          photos: {
            where: { isPrivate: true, isApproved: true },
            orderBy: { position: "asc" },
          },
          videos: {
            where: { isPrivate: true, isApproved: true },
            orderBy: { position: "asc" },
          },
        },
      },
    },
  })

  if (!access || access.status === "EXPIRED") notFound()

  const { profile } = access
  const firstPublicPhoto = await prisma.photo.findFirst({
    where: { profileId: profile.id, isPrivate: false, isApproved: true },
    orderBy: { isMain: "desc" },
    select: { cdnUrl: true },
  })

  const mediaItems: MediaItem[] = [
    ...profile.photos.map((ph) => ({
      id: ph.id,
      url: ph.cdnUrl,
      type: "photo" as const,
    })),
    ...profile.videos.map((v) => ({
      id: v.id,
      url: v.cdnUrl,
      type: "video" as const,
      thumbnail: firstPublicPhoto?.cdnUrl,
    })),
  ]

  return (
    <>
      <Header />

      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-4">
          <Link
            href={`/profil/${profile.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour au profil
          </Link>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--gold-muted)", border: "1px solid var(--border-gold)" }}>
              <Lock className="w-5 h-5 text-[var(--gold)]" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
                Galerie privée
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                {profile.displayName} · {profile.photos.length} photo{profile.photos.length > 1 ? "s" : ""}
                {profile.videos.length > 0 && ` · ${profile.videos.length} vidéo${profile.videos.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {mediaItems.length > 0 ? (
            <PhotoLightbox items={mediaItems} />
          ) : (
            <div className="card-luxury p-12 text-center">
              <Lock className="w-8 h-8 text-[var(--gold)]/30 mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">La galerie privée est vide pour le moment.</p>
            </div>
          )}

          <p className="text-[10px] text-center text-[var(--text-muted)] mt-8">
            Ce lien est personnel · Ne pas partager · Accès pour {access.email}
          </p>
        </div>
      </main>

      <Footer />
    </>
  )
}
