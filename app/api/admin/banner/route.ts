import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { prisma } from "@/lib/prisma"
import sharp from "sharp"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-me")

export async function POST(req: NextRequest) {
  const jar = await cookies()
  const token = jar.get("velvet_session")?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(payload.role as string)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const profileId = formData.get("profileId") as string | null
  const file = formData.get("file") as File | null

  if (!profileId) return NextResponse.json({ error: "Missing profileId" }, { status: 400 })
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: "Format invalide (JPG, PNG, WebP)" }, { status: 400 })
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 15 Mo)" }, { status: 400 })
  }

  const profile = await prisma.professionalProfile.findUnique({ where: { id: profileId } })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `banner-${randomUUID()}.jpg`
  const uploadDir = join(process.cwd(), "public", "uploads", "profiles")
  await mkdir(uploadDir, { recursive: true })

  // Banner: 1200×675 (16:9)
  await sharp(buffer)
    .resize(1200, 675, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88, progressive: true })
    .toFile(join(uploadDir, filename))

  const bannerUrl = `/uploads/profiles/${filename}?v=${Date.now()}`
  const bannerStoragePath = join("uploads", "profiles", filename)

  await prisma.professionalProfile.update({
    where: { id: profileId },
    data: { bannerUrl, bannerStoragePath },
  })

  return NextResponse.json({ success: true, bannerUrl })
}
