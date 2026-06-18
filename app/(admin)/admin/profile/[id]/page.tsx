import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, XCircle, PauseCircle, FileText, Save, Star, Trash2, Lock, Unlock } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { PROFILE_STATUS_LABELS, KYC_STATUS_LABELS, formatDate } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { unlink } from "fs/promises"
import { join } from "path"
import { PhotoCropButton } from "@/components/features/admin/photo-crop-button"
import { AdminPhotoUploader } from "@/components/features/admin/admin-photo-uploader"
import { AdminBannerManager } from "@/components/features/admin/admin-banner-manager"
import { AdminVideoUploader } from "@/components/features/admin/admin-video-uploader"

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function AdminProfileDetailPage({ params, searchParams }: Props) {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  const { id } = await params
  const { saved } = await searchParams

  const [profile, cities] = await Promise.all([
    prisma.professionalProfile.findUnique({
      where: { id },
      include: {
        city: true,
        photos: { orderBy: [{ isMain: "desc" }, { position: "asc" }] },
        videos: { orderBy: { createdAt: "asc" } },
        kycDocuments: { orderBy: { submittedAt: "desc" } },
        user: { select: { email: true, createdAt: true } },
        _count: { select: { reports: true, reviews: true } },
      },
    }),
    prisma.city.findMany({ where: { isActive: true }, orderBy: { nameDE: "asc" } }),
  ])

  if (!profile) notFound()

  async function saveProfile(formData: FormData) {
    "use server"
    const langsRaw = (formData.get("languages") as string ?? "").trim()
    const languages = langsRaw ? langsRaw.split(",").map((l) => l.trim().toLowerCase()).filter(Boolean) : []
    const tagsRaw = (formData.get("servicesTags") as string ?? "").trim()
    const servicesTags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : []
    await prisma.professionalProfile.update({
      where: { id },
      data: {
        displayName:  (formData.get("displayName") as string)?.trim() || undefined,
        age:          parseInt(formData.get("age") as string) || undefined,
        cityId:       (formData.get("cityId") as string) || undefined,
        districtName: (formData.get("districtName") as string)?.trim() || null,
        type:         (formData.get("type") as string) === "AGENCY" ? "AGENCY" : "INDEPENDENT",
        tagline:      (formData.get("tagline") as string)?.trim() || null,
        bio:          (formData.get("bio") as string)?.trim() || null,
        incall:       formData.get("incall") === "on",
        outcall:      formData.get("outcall") === "on",
        travel:       formData.get("travel") === "on",
        languages,
        servicesTags,
        heightCm:     parseInt(formData.get("heightCm") as string) || null,
        weightKg:     parseInt(formData.get("weightKg") as string) || null,
        bustCm:       parseInt(formData.get("bustCm") as string) || null,
        waistCm:      parseInt(formData.get("waistCm") as string) || null,
        hipCm:        parseInt(formData.get("hipCm") as string) || null,
        cupSize:      (formData.get("cupSize") as string)?.trim() || null,
        adminNote:    (formData.get("adminNote") as string)?.trim() || null,
        privateGalleryPrice: (() => {
          const raw = (formData.get("privateGalleryPrice") as string)?.trim()
          if (!raw) return null
          const n = parseFloat(raw)
          return isNaN(n) || n <= 0 ? null : n
        })(),
      },
    })
    redirect(`/admin/profile/${id}?saved=1`)
  }

  async function setMainPhoto(formData: FormData) {
    "use server"
    const photoId = formData.get("photoId") as string
    await prisma.$transaction([
      prisma.photo.updateMany({ where: { profileId: id }, data: { isMain: false } }),
      prisma.photo.update({ where: { id: photoId }, data: { isMain: true } }),
    ])
    revalidatePath(`/admin/profile/${id}`)
  }

  async function deletePhoto(formData: FormData) {
    "use server"
    const photoId = formData.get("photoId") as string
    const photo = await prisma.photo.findUnique({ where: { id: photoId } })
    if (!photo || photo.profileId !== id) return
    await prisma.photo.delete({ where: { id: photoId } })
    if (photo.storagePath) {
      await unlink(join(process.cwd(), "public", photo.storagePath)).catch(() => {})
    }
    revalidatePath(`/admin/profile/${id}`)
  }

  async function togglePrivateVideo(formData: FormData) {
    "use server"
    const videoId = formData.get("videoId") as string
    const current = formData.get("isPrivate") === "true"
    await prisma.video.update({ where: { id: videoId }, data: { isPrivate: !current } })
    revalidatePath(`/admin/profile/${id}`)
  }

  async function togglePrivatePhoto(formData: FormData) {
    "use server"
    const photoId = formData.get("photoId") as string
    const current = formData.get("isPrivate") === "true"
    await prisma.photo.update({ where: { id: photoId }, data: { isPrivate: !current } })
    revalidatePath(`/admin/profile/${id}`)
  }

  async function approveProfile() {
    "use server"
    await prisma.professionalProfile.update({
      where: { id },
      data: { status: "APPROVED", publishedAt: new Date(), kycStatus: "APPROVED", lastReviewedAt: new Date() },
    })
    revalidatePath("/admin/profile")
    revalidatePath(`/admin/profile/${id}`)
  }

  async function suspendProfile() {
    "use server"
    await prisma.professionalProfile.update({
      where: { id },
      data: { status: "SUSPENDED", lastReviewedAt: new Date() },
    })
    revalidatePath("/admin/profile")
    revalidatePath(`/admin/profile/${id}`)
  }

  async function deleteVideo(formData: FormData) {
    "use server"
    const videoId = formData.get("videoId") as string
    const video = await prisma.video.findUnique({ where: { id: videoId } })
    if (!video || video.profileId !== id) return
    await prisma.video.delete({ where: { id: videoId } })
    if (video.storagePath) {
      const { unlink } = await import("fs/promises")
      const { join } = await import("path")
      await unlink(join(process.cwd(), "public", video.storagePath)).catch(() => {})
    }
    revalidatePath(`/admin/profile/${id}`)
  }

  async function rejectProfile() {
    "use server"
    await prisma.professionalProfile.update({
      where: { id },
      data: { status: "REJECTED", lastReviewedAt: new Date() },
    })
    revalidatePath("/admin/profile")
    revalidatePath(`/admin/profile/${id}`)
  }

  const sl = PROFILE_STATUS_LABELS[profile.status]
  const kl = KYC_STATUS_LABELS[profile.kycStatus]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/profile" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </Button>
        <div>
          <p className="label-luxury">Admin · Profil</p>
          <h1 className="text-2xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            {profile.displayName}
          </h1>
        </div>
      </div>

      {/* Success banner */}
      {saved === "1" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)] bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Profil enregistré avec succès.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Edit form + Photos */}
        <div className="lg:col-span-2 space-y-5">

          {/* Edit form */}
          <form action={saveProfile} className="card-luxury p-5 space-y-5">
            <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">Modifier le profil</h2>

            {/* Identité */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Nom d&apos;affichage</label>
                <input name="displayName" defaultValue={profile.displayName}
                  className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Âge</label>
                <input name="age" type="number" min={18} max={80} defaultValue={profile.age}
                  className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Type</label>
                <select name="type" defaultValue={profile.type}
                  className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors">
                  <option value="INDEPENDENT">Indépendante</option>
                  <option value="AGENCY">Agence</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Email</label>
                <input value={profile.user.email} disabled readOnly
                  className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-muted)] cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Ville</label>
                <select name="cityId" defaultValue={profile.cityId}
                  className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors">
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.nameDE}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Quartier</label>
                <input name="districtName" defaultValue={profile.districtName ?? ""}
                  className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Accroche</label>
                <input name="tagline" defaultValue={profile.tagline ?? ""} maxLength={120}
                  className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Biographie</label>
                <textarea name="bio" defaultValue={profile.bio ?? ""} rows={4}
                  className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                  Langues <span className="normal-case text-[var(--text-muted)]">(séparées par virgule)</span>
                </label>
                <input name="languages" defaultValue={profile.languages.join(", ")}
                  placeholder="fr, en, de"
                  className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                  Tags <span className="normal-case text-[var(--text-muted)]">(séparés par virgule)</span>
                </label>
                <input name="servicesTags" defaultValue={profile.servicesTags.join(", ")}
                  placeholder="GFE, Massage, ..."
                  className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors" />
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-3">Caractéristiques physiques</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { name: "heightCm", label: "Taille",   val: profile.heightCm },
                  { name: "weightKg", label: "Poids",    val: profile.weightKg },
                  { name: "bustCm",   label: "Poitrine", val: profile.bustCm },
                  { name: "waistCm",  label: "Ceinture", val: profile.waistCm },
                  { name: "hipCm",    label: "Hanches",  val: profile.hipCm },
                ].map(({ name, label, val }) => (
                  <div key={name} className="space-y-1">
                    <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">{label}</label>
                    <input name={name} type="number" defaultValue={val ?? ""}
                      className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors" />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Bonnet</label>
                  <select name="cupSize" defaultValue={profile.cupSize ?? ""}
                    className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors">
                    <option value="">—</option>
                    {["A","B","C","D","DD","E","F"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              {[
                { name: "incall",  label: "Incall",  checked: profile.incall },
                { name: "outcall", label: "Outcall", checked: profile.outcall },
                { name: "travel",  label: "Voyage",  checked: profile.travel },
              ].map(({ name, label, checked }) => (
                <label key={name} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name={name} defaultChecked={checked} className="w-4 h-4 accent-[var(--gold)]" />
                  <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Note interne (non visible)</label>
              <textarea name="adminNote" defaultValue={profile.adminNote ?? ""} rows={2}
                className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors resize-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Prix galerie privée (€)</label>
              <div className="relative max-w-[160px]">
                <input
                  name="privateGalleryPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={profile.privateGalleryPrice ? String(profile.privateGalleryPrice) : ""}
                  placeholder="Ex : 9.99"
                  className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 pr-7 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">€</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">Laisser vide pour désactiver la galerie payante</p>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-[var(--r-lg)] bg-[var(--gold)] text-[var(--noir)] text-sm font-medium hover:opacity-90 transition-opacity">
                <Save className="w-4 h-4" /> Enregistrer
              </button>
            </div>
          </form>

          {/* Banner management */}
          <div className="card-luxury p-5">
            <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-4">
              Bannière (16:9)
            </h2>
            <AdminBannerManager profileId={profile.id} currentBannerUrl={profile.bannerUrl} />
          </div>

          {/* Photos management */}
          <div className="card-luxury p-5">
            <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-4">
              Photos ({profile.photos.length})
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {profile.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-[3/4] rounded-[var(--r-lg)] bg-[var(--surface-3)] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.cdnUrl} alt="" className="w-full h-full object-cover" />
                    </div>

                    {photo.isMain && (
                      <span className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[9px] bg-[var(--gold)] text-[var(--noir)] px-1.5 py-0.5 rounded font-medium">
                        <Star className="w-2.5 h-2.5" /> Principale
                      </span>
                    )}
                    {photo.isPrivate && (
                      <span className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full">
                        <Lock className="w-3 h-3 text-[var(--gold)]" />
                      </span>
                    )}

                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[var(--r-lg)] flex flex-col items-center justify-center gap-2 p-2">
                      {!photo.isMain && (
                        <form action={setMainPhoto}>
                          <input type="hidden" name="photoId" value={photo.id} />
                          <button type="submit"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--gold)] text-[var(--noir)] text-[11px] font-medium hover:opacity-90 transition-opacity w-full justify-center">
                            <Star className="w-3 h-3" /> Principale
                          </button>
                        </form>
                      )}
                      <form action={togglePrivatePhoto}>
                        <input type="hidden" name="photoId" value={photo.id} />
                        <input type="hidden" name="isPrivate" value={String(photo.isPrivate)} />
                        <button type="submit"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 text-white text-[11px] font-medium hover:bg-black/60 transition-colors w-full justify-center">
                          {photo.isPrivate
                            ? <><Unlock className="w-3 h-3" /> Rendre public</>
                            : <><Lock className="w-3 h-3" /> Rendre privé</>
                          }
                        </button>
                      </form>
                      <PhotoCropButton photoId={photo.id} cdnUrl={photo.cdnUrl} />
                      <form action={deletePhoto}>
                        <input type="hidden" name="photoId" value={photo.id} />
                        <button type="submit"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--error)]/80 text-white text-[11px] font-medium hover:bg-[var(--error)] transition-colors w-full justify-center">
                          <Trash2 className="w-3 h-3" /> Supprimer
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
                {/* Add photo card */}
                <AdminPhotoUploader profileId={profile.id} />
              </div>
          </div>

          {/* Videos management */}
          <div className="card-luxury p-5">
            <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-4">
              Vidéos ({profile.videos.length})
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {profile.videos.map((video) => (
                <div key={video.id} className="relative group">
                  <div className="aspect-[3/4] rounded-[var(--r-lg)] bg-[var(--surface-3)] overflow-hidden flex items-center justify-center">
                    <video src={video.cdnUrl} className="w-full h-full object-cover" preload="metadata" muted />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  </div>
                  {video.isPrivate && (
                    <span className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full z-10">
                      <Lock className="w-3 h-3 text-[var(--gold)]" />
                    </span>
                  )}
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[var(--r-lg)] flex flex-col items-center justify-center gap-2 p-2">
                    <form action={togglePrivateVideo}>
                      <input type="hidden" name="videoId" value={video.id} />
                      <input type="hidden" name="isPrivate" value={String(video.isPrivate)} />
                      <button type="submit"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 text-white text-[11px] font-medium hover:bg-black/60 transition-colors w-full justify-center">
                        {video.isPrivate
                          ? <><Unlock className="w-3 h-3" /> Rendre public</>
                          : <><Lock className="w-3 h-3" /> Rendre privé</>
                        }
                      </button>
                    </form>
                    <form action={deleteVideo}>
                      <input type="hidden" name="videoId" value={video.id} />
                      <button type="submit"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--error)]/80 text-white text-[11px] font-medium hover:bg-[var(--error)] transition-colors">
                        <Trash2 className="w-3 h-3" /> Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              <AdminVideoUploader profileId={profile.id} />
            </div>
          </div>

          {/* KYC docs */}
          {profile.kycDocuments.length > 0 && (
            <div className="card-luxury p-5">
              <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                Documents KYC ({profile.kycDocuments.length})
              </h2>
              <div className="space-y-2">
                {profile.kycDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-[var(--r-lg)] bg-[var(--surface-3)] border border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--gold)]" />
                      <div>
                        <p className="text-sm text-[var(--text-primary)]">{doc.docType}</p>
                        <p className="text-xs text-[var(--text-muted)]">{formatDate(doc.submittedAt)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${doc.status === "APPROVED" ? "text-[var(--success)] bg-[var(--success)]/10" : doc.status === "REJECTED" ? "text-[var(--error)] bg-[var(--error)]/10" : "text-[var(--warning)] bg-[var(--warning)]/10"}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          <div className="card-luxury p-5 space-y-3">
            <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">Statut</h2>
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm px-3 py-1 rounded-[var(--r-lg)]" style={{ color: sl.color, background: `${sl.color}18` }}>
                {sl.fr}
              </span>
              <span className="text-sm px-3 py-1 rounded-[var(--r-lg)]" style={{ color: kl.color, background: `${kl.color}18` }}>
                KYC : {kl.fr}
              </span>
            </div>

            <div className="space-y-2 pt-2">
              {profile.status !== "APPROVED" && (
                <form action={approveProfile}>
                  <button type="submit" className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[var(--r-lg)] text-sm text-[var(--success)] bg-[var(--success)]/10 hover:bg-[var(--success)]/20 transition-colors border border-[var(--success)]/20">
                    <CheckCircle2 className="w-4 h-4" /> Approuver
                  </button>
                </form>
              )}
              {profile.status !== "SUSPENDED" && (
                <form action={suspendProfile}>
                  <button type="submit" className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[var(--r-lg)] text-sm text-[var(--warning)] bg-[var(--warning)]/10 hover:bg-[var(--warning)]/20 transition-colors border border-[var(--warning)]/20">
                    <PauseCircle className="w-4 h-4" /> Suspendre
                  </button>
                </form>
              )}
              {profile.status !== "REJECTED" && (
                <form action={rejectProfile}>
                  <button type="submit" className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[var(--r-lg)] text-sm text-[var(--error)] bg-[var(--error)]/10 hover:bg-[var(--error)]/20 transition-colors border border-[var(--error)]/20">
                    <XCircle className="w-4 h-4" /> Rejeter
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="card-luxury p-5 space-y-2">
            <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-2">Infos</h2>
            {[
              ["Email", profile.user.email],
              ["Créé", formatDate(profile.createdAt)],
              ["Signalements", String(profile._count.reports)],
              ["Avis", String(profile._count.reviews)],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-xs py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-muted)]">{label}</span>
                <span className="text-[var(--text-secondary)]">{val}</span>
              </div>
            ))}
          </div>

          <div className="card-luxury p-5 space-y-2">
            <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-2">Liens</h2>
            {profile.status === "APPROVED" && profile.kycStatus === "APPROVED" ? (
              <Button asChild variant="surface" size="sm" className="w-full justify-start">
                <Link href={`/profil/${profile.slug}`} target="_blank">Voir le profil public ↗</Link>
              </Button>
            ) : (
              <Button asChild variant="surface" size="sm" className="w-full justify-start">
                <Link href={`/admin/profile/${id}/preview`} target="_blank">Prévisualiser ↗</Link>
              </Button>
            )}
            <Button asChild variant="surface" size="sm" className="w-full justify-start">
              <Link href={`/admin/meldungen?profileId=${profile.id}`}>Signalements ({profile._count.reports})</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
