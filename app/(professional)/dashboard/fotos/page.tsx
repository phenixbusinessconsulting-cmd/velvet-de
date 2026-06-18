"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { ArrowLeft, Star, Trash2, Lock, Unlock } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { PhotoUploader } from "@/components/features/dashboard/photo-uploader"

async function setMainPhoto(photoId: string) {
  "use server"
  const h = await headers()
  const userId = h.get("x-user-id")
  if (!userId) throw new Error("Unauthorized")
  const profile = await prisma.professionalProfile.findUnique({ where: { userId } })
  if (!profile) throw new Error("No profile")
  await prisma.$transaction([
    prisma.photo.updateMany({ where: { profileId: profile.id }, data: { isMain: false } }),
    prisma.photo.update({ where: { id: photoId }, data: { isMain: true } }),
  ])
  revalidatePath("/dashboard/fotos")
}

async function deletePhoto(photoId: string) {
  "use server"
  const h = await headers()
  const userId = h.get("x-user-id")
  if (!userId) throw new Error("Unauthorized")
  const profile = await prisma.professionalProfile.findUnique({ where: { userId } })
  if (!profile) throw new Error("No profile")
  await prisma.photo.delete({ where: { id: photoId, profileId: profile.id } })
  revalidatePath("/dashboard/fotos")
}

async function togglePrivate(photoId: string, current: boolean) {
  "use server"
  const h = await headers()
  const userId = h.get("x-user-id")
  if (!userId) throw new Error("Unauthorized")
  const profile = await prisma.professionalProfile.findUnique({ where: { userId } })
  if (!profile) throw new Error("No profile")
  await prisma.photo.update({
    where: { id: photoId, profileId: profile.id },
    data: { isPrivate: !current },
  })
  revalidatePath("/dashboard/fotos")
}

export default async function DashboardFotosPage() {
  const h = await headers()
  const userId = h.get("x-user-id")
  if (!userId) redirect("/anmelden?next=/dashboard/fotos")

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
    include: { photos: { orderBy: [{ isMain: "desc" }, { position: "asc" }] } },
  })

  const publicPhotos = profile?.photos.filter((p) => !p.isPrivate) ?? []
  const privatePhotos = profile?.photos.filter((p) => p.isPrivate) ?? []

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </Button>
        <div>
          <p className="label-luxury">Mon espace · Photos</p>
          <h1 className="text-2xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            Mes photos
          </h1>
        </div>
      </div>

      <PhotoUploader onUploaded={() => {}} />

      {/* Public photos */}
      <div className="card-luxury p-6">
        <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-4">
          Photos publiques ({publicPhotos.length})
        </h2>
        {publicPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {publicPhotos.map((photo) => (
              <div key={photo.id} className="relative group aspect-[3/4] rounded-[var(--r-lg)] overflow-hidden bg-[var(--surface-3)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.cdnUrl} alt="" className="w-full h-full object-cover" />
                {photo.isMain && (
                  <span className="absolute top-2 left-2 text-[9px] bg-[var(--gold)] text-[var(--noir)] px-1.5 py-0.5 rounded font-medium">
                    PRINCIPALE
                  </span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!photo.isMain && (
                    <form action={async () => { "use server"; await setMainPhoto(photo.id) }}>
                      <button type="submit" className="p-2 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/30 transition-colors" title="Photo principale">
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}
                  <form action={async () => { "use server"; await togglePrivate(photo.id, false) }}>
                    <button type="submit" className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors" title="Rendre privée">
                      <Lock className="w-3.5 h-3.5" />
                    </button>
                  </form>
                  <form action={async () => { "use server"; await deletePhoto(photo.id) }}>
                    <button type="submit" className="p-2 rounded-full bg-[var(--error)]/20 border border-[var(--error)]/40 text-[var(--error)] hover:bg-[var(--error)]/30 transition-colors" title="Supprimer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Aucune photo publique.</p>
        )}
      </div>

      {/* Private gallery */}
      <div className="card-luxury p-6" style={{ border: "1px solid var(--border-gold)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-[var(--gold)]" />
          <h2 className="text-sm font-medium text-[var(--pearl)] uppercase tracking-wide">
            Galerie privée ({privatePhotos.length})
          </h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Ces photos ne sont pas visibles sur votre profil public.
        </p>
        {privatePhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {privatePhotos.map((photo) => (
              <div key={photo.id} className="relative group aspect-[3/4] rounded-[var(--r-lg)] overflow-hidden bg-[var(--surface-3)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.cdnUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 p-1 bg-black/60 rounded-full">
                  <Lock className="w-3 h-3 text-[var(--gold)]" />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <form action={async () => { "use server"; await togglePrivate(photo.id, true) }}>
                    <button type="submit" className="p-2 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/30 transition-colors" title="Rendre publique">
                      <Unlock className="w-3.5 h-3.5" />
                    </button>
                  </form>
                  <form action={async () => { "use server"; await deletePhoto(photo.id) }}>
                    <button type="submit" className="p-2 rounded-full bg-[var(--error)]/20 border border-[var(--error)]/40 text-[var(--error)] hover:bg-[var(--error)]/30 transition-colors" title="Supprimer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Aucune photo privée. Cochez "Galerie privée" lors de l'ajout d'une photo, ou verrouillez une photo publique.</p>
        )}
      </div>
    </div>
  )
}
