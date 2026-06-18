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
  // Auth
  const jar = await cookies()
  const token = jar.get("velvet_session")?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let userId: string
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    userId = payload.sub as string
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.professionalProfile.findUnique({ where: { userId } })
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 })

  // Parse form
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const isMain = formData.get("isMain") === "true"
  const isPrivate = formData.get("isPrivate") === "true"

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 })
  }

  // Process with sharp
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${randomUUID()}.jpg`
  const uploadDir = join(process.cwd(), "public", "uploads", "profiles")
  await mkdir(uploadDir, { recursive: true })

  await sharp(buffer)
    .resize(800, 1067, { fit: "cover", position: "centre" }) // 3:4 ratio
    .jpeg({ quality: 85, progressive: true })
    .toFile(join(uploadDir, filename))

  const cdnUrl = `/uploads/profiles/${filename}?v=${Date.now()}`

  // If isMain, unset previous main
  if (isMain) {
    await prisma.photo.updateMany({
      where: { profileId: profile.id },
      data: { isMain: false },
    })
  }

  const count = await prisma.photo.count({ where: { profileId: profile.id } })

  const photo = await prisma.photo.create({
    data: {
      profileId: profile.id,
      cdnUrl,
      storagePath: join("uploads", "profiles", filename),
      isMain: isMain || count === 0,
      isApproved: true,
      isPrivate,
      position: count,
    },
  })

  return NextResponse.json({ success: true, photo })
}

export const config = { api: { bodyParser: false } }
