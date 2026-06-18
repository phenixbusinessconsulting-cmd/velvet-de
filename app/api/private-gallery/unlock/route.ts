import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { profileId, email } = await req.json()

  if (!profileId || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 })
  }

  const profile = await prisma.professionalProfile.findUnique({
    where: { id: profileId },
    select: { privateGalleryPrice: true },
  })

  if (!profile?.privateGalleryPrice) {
    return NextResponse.json({ error: "Galerie privée non disponible" }, { status: 404 })
  }

  // Check existing valid access
  const existing = await prisma.privateGalleryAccess.findFirst({
    where: { profileId, email, status: { in: ["SIMULATED", "PAID"] } },
  })
  if (existing) {
    return NextResponse.json({ token: existing.token })
  }

  const access = await prisma.privateGalleryAccess.create({
    data: {
      profileId,
      email,
      amount: profile.privateGalleryPrice,
      status: "SIMULATED",
    },
  })

  return NextResponse.json({ token: access.token })
}
