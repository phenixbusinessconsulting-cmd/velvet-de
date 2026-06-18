import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-me")
const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"]
const MAX_SIZE = 200 * 1024 * 1024 // 200 MB

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
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format invalide (MP4, MOV, WebM)" }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 200 Mo)" }, { status: 400 })
  }

  const profile = await prisma.professionalProfile.findUnique({ where: { id: profileId } })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const ext = file.type === "video/quicktime" ? "mov" : file.type === "video/webm" ? "webm" : "mp4"
  const filename = `video-${randomUUID()}.${ext}`
  const uploadDir = join(process.cwd(), "public", "uploads", "profiles")
  await mkdir(uploadDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, filename), buffer)

  const cdnUrl = `/uploads/profiles/${filename}`
  const storagePath = join("uploads", "profiles", filename)

  const video = await prisma.video.create({
    data: { profileId, cdnUrl, storagePath, isApproved: true },
  })

  return NextResponse.json({ success: true, video })
}
