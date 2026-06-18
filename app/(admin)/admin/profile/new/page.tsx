import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { AdminCreateProfileForm } from "@/components/features/admin/admin-create-profile-form"

export default async function NewProfilePage() {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  const cities = await prisma.city.findMany({
    select: { id: true, nameDE: true },
    orderBy: { nameDE: "asc" },
  })

  async function createProfile(formData: FormData): Promise<{ error?: string; id?: string }> {
    "use server"
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const displayName = formData.get("displayName") as string
    const ageRaw = formData.get("age") as string
    const cityId = formData.get("cityId") as string
    const slug = formData.get("slug") as string
    const tagline = formData.get("tagline") as string

    if (!email || !password || !displayName || !ageRaw || !cityId || !slug) {
      return { error: "Tous les champs obligatoires doivent être remplis." }
    }

    const age = parseInt(ageRaw)
    if (isNaN(age) || age < 18 || age > 99) {
      return { error: "L'âge doit être compris entre 18 et 99." }
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) return { error: "Cet email est déjà utilisé." }

    const existingSlug = await prisma.professionalProfile.findUnique({ where: { slug } })
    if (existingSlug) return { error: "Ce slug est déjà utilisé." }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "PROFESSIONAL",
        emailVerified: true,
      },
    })

    const profile = await prisma.professionalProfile.create({
      data: {
        userId: user.id,
        displayName,
        age,
        cityId,
        slug,
        tagline: tagline || null,
        status: "DRAFT",
        kycStatus: "PENDING",
      },
    })

    return { id: profile.id }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <Link
          href="/admin/profile"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux profils
        </Link>
        <p className="label-luxury mb-2">Admin · Gestion</p>
        <h1 className="text-3xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
          Nouveau profil
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Créer un compte professionnel</p>
      </div>

      <AdminCreateProfileForm cities={cities} createProfile={createProfile} />
    </div>
  )
}
