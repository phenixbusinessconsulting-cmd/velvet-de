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
    const role = payload.role as string
    if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const profileId = formData.get("profileId") as string | null
  const file = formData.get("file") as File | null
  const isMain = formData.get("isMain") === "true"

  if (!profileId) return NextResponse.json({ error: "Missing profileId" }, { status: 400 })
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: "Format invalide (JPG, PNG, WebP)" }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 })
  }

  const profile = await prisma.professionalProfile.findUnique({ where: { id: profileId } })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${randomUUID()}.jpg`
  const uploadDir = join(process.cwd(), "public", "uploads", "profiles")
  await mkdir(uploadDir, { recursive: true })

  await sharp(buffer)
    .resize(800, 1067, { fit: "cover", position: "centre" })
    .jpeg({ quality: 85, progressive: true })
    .toFile(join(uploadDir, filename))

  if (isMain) {
    await prisma.photo.updateMany({ where: { profileId }, data: { isMain: false } })
  }

  const count = await prisma.photo.count({ where: { profileId } })

  const photo = await prisma.photo.create({
    data: {
      profileId,
      cdnUrl: `/uploads/profiles/${filename}?v=${Date.now()}`,
      storagePath: join("uploads", "profiles", filename),
      isMain: isMain || count === 0,
      isApproved: true,
      position: count,
    },
  })

  return NextResponse.json({ success: true, photo })
}
