"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"

async function saveProfile(formData: FormData) {
  "use server"
  const h = await headers()
  const userId = h.get("x-user-id")
  if (!userId) throw new Error("Unauthorized")

  const profile = await prisma.professionalProfile.findUnique({ where: { userId } })
  if (!profile) throw new Error("Profile not found")

  await prisma.professionalProfile.update({
    where: { userId },
    data: {
      displayName:  (formData.get("displayName") as string)?.trim() || profile.displayName,
      age:          parseInt(formData.get("age") as string) || profile.age,
      tagline:      (formData.get("tagline") as string)?.trim() || null,
      bio:          (formData.get("bio") as string)?.trim() || null,
      incall:       formData.get("incall") === "on",
      outcall:      formData.get("outcall") === "on",
      travel:       formData.get("travel") === "on",
      heightCm:     parseInt(formData.get("heightCm") as string) || null,
      weightKg:     parseInt(formData.get("weightKg") as string) || null,
      bustCm:       parseInt(formData.get("bustCm") as string) || null,
      waistCm:      parseInt(formData.get("waistCm") as string) || null,
      hipCm:        parseInt(formData.get("hipCm") as string) || null,
      cupSize:      (formData.get("cupSize") as string)?.trim() || null,
      privateGalleryPrice: (() => {
        const raw = (formData.get("privateGalleryPrice") as string)?.trim()
        if (!raw) return null
        const n = parseFloat(raw)
        return isNaN(n) || n <= 0 ? null : n
      })(),
    },
  })

  revalidatePath("/dashboard/profil")
  revalidatePath("/dashboard")
}

export default async function DashboardProfilPage() {
  const h = await headers()
  const userId = h.get("x-user-id")
  if (!userId) redirect("/anmelden?next=/dashboard/profil")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { professionalProfile: { include: { city: true } } },
  })
  if (!user) redirect("/anmelden")

  const profile = user.professionalProfile
  const cities = await prisma.city.findMany({ where: { isActive: true }, orderBy: { nameDE: "asc" } })

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </Button>
        <div>
          <p className="label-luxury">Mon espace · Profil</p>
          <h1 className="text-2xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            Modifier mon profil
          </h1>
        </div>
      </div>

      <form action={saveProfile} className="space-y-6">
        {/* Identity */}
        <div className="card-luxury p-6 space-y-4">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">Identité</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Nom d&apos;affichage</label>
              <input
                name="displayName"
                defaultValue={profile?.displayName ?? ""}
                maxLength={60}
                className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Âge</label>
              <input
                name="age"
                type="number"
                min={18}
                max={80}
                defaultValue={profile?.age ?? ""}
                className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Ville</label>
              <select
                name="cityId"
                defaultValue={profile?.cityId ?? ""}
                className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameDE}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Accroche (120 car. max)</label>
              <input
                name="tagline"
                defaultValue={profile?.tagline ?? ""}
                maxLength={120}
                className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Biographie</label>
              <textarea
                name="bio"
                defaultValue={profile?.bio ?? ""}
                rows={5}
                className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Physical */}
        <div className="card-luxury p-6 space-y-4">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">Caractéristiques physiques</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { name: "heightCm", label: "Taille (cm)", val: profile?.heightCm },
              { name: "weightKg", label: "Poids (kg)",  val: profile?.weightKg },
              { name: "bustCm",   label: "Poitrine (cm)", val: profile?.bustCm },
              { name: "waistCm",  label: "Taille (cm)",   val: profile?.waistCm },
              { name: "hipCm",    label: "Hanches (cm)",  val: profile?.hipCm },
            ].map(({ name, label, val }) => (
              <div key={name} className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{label}</label>
                <input
                  name={name}
                  type="number"
                  defaultValue={val ?? ""}
                  className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Bonnet</label>
              <select
                name="cupSize"
                defaultValue={profile?.cupSize ?? ""}
                className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors"
              >
                <option value="">—</option>
                {["A","B","C","D","DD","E","F"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="card-luxury p-6 space-y-4">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">Services proposés</h2>
          <div className="flex flex-wrap gap-6">
            {[
              { name: "incall",  label: "Incall (à domicile)", checked: profile?.incall },
              { name: "outcall", label: "Outcall (déplacement)", checked: profile?.outcall },
              { name: "travel",  label: "Voyage", checked: profile?.travel },
            ].map(({ name, label, checked }) => (
              <label key={name} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name={name}
                  defaultChecked={checked ?? false}
                  className="w-4 h-4 accent-[var(--gold)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Private gallery price */}
        <div className="card-luxury p-6 space-y-3">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">Galerie privée</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Fixez un prix pour débloquer vos photos et vidéos privées. Laissez vide pour désactiver.
          </p>
          <div className="flex items-center gap-3 max-w-xs">
            <div className="relative flex-1">
              <input
                name="privateGalleryPrice"
                type="number"
                min="1"
                step="0.01"
                defaultValue={profile?.privateGalleryPrice ? String(profile.privateGalleryPrice) : ""}
                placeholder="Ex : 9.99"
                className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2.5 pr-8 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-gold)] transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">€</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="gold" className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Enregistrer
          </Button>
        </div>
      </form>
    </div>
  )
}
