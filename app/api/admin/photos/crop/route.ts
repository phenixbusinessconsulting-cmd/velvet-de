import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import sharp from "sharp"
import { readFile, writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(req: NextRequest) {
  // Auth check
  const cookieStore = await cookies()
  const token = cookieStore.get("velvet_session")?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "secret")
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string
    if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  const body = await req.json()
  const { photoId, crop } = body as {
    photoId: string
    crop: { x: number; y: number; width: number; height: number }
  }

  if (!photoId || !crop) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const photo = await prisma.photo.findUnique({ where: { id: photoId } })
  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 })

  const cdnPathClean = photo.cdnUrl.split("?")[0]
  const isLocalPath = (p: string) => p && !p.startsWith("http")

  let imageBuffer: Buffer

  if (isLocalPath(photo.storagePath ?? "")) {
    // Uploaded file — read from local disk
    try {
      imageBuffer = await readFile(join(process.cwd(), "public", photo.storagePath!))
    } catch {
      return NextResponse.json({ error: "Image file not found on disk" }, { status: 404 })
    }
  } else if (isLocalPath(cdnPathClean)) {
    // Seeded photo — static file in public/
    try {
      imageBuffer = await readFile(join(process.cwd(), "public", cdnPathClean))
    } catch {
      return NextResponse.json({ error: "Image file not found on disk" }, { status: 404 })
    }
  } else {
    // External URL (randomuser.me etc.) — fetch over HTTP
    try {
      const res = await fetch(cdnPathClean)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      imageBuffer = Buffer.from(await res.arrayBuffer())
    } catch (e) {
      return NextResponse.json({ error: `Cannot fetch remote image: ${(e as Error).message}` }, { status: 422 })
    }
  }

  // Ensure uploads dir exists (persistent Docker volume)
  const uploadsDir = join(process.cwd(), "public", "uploads", "profiles")
  await mkdir(uploadsDir, { recursive: true })

  const filename = `${photoId}-crop.jpg`
  const relPath = join("uploads", "profiles", filename)
  const destPath = join(process.cwd(), "public", relPath)

  // Get actual image dimensions to validate crop bounds
  const meta = await sharp(imageBuffer).metadata()
  const imgW = meta.width ?? 800
  const imgH = meta.height ?? 1067

  const left   = Math.max(0, Math.round(crop.x))
  const top    = Math.max(0, Math.round(crop.y))
  const width  = Math.min(Math.round(crop.width),  imgW - left)
  const height = Math.min(Math.round(crop.height), imgH - top)

  if (width <= 0 || height <= 0) {
    return NextResponse.json({ error: "Invalid crop area" }, { status: 400 })
  }

  const cropped = await sharp(imageBuffer)
    .extract({ left, top, width, height })
    .resize(800, 1067, { fit: "cover" })
    .jpeg({ quality: 85 })
    .toBuffer()

  await writeFile(destPath, cropped)

  // Cache-bust the URL so browser loads fresh image
  const newCdnUrl = `/uploads/profiles/${filename}?v=${Date.now()}`

  await prisma.photo.update({
    where: { id: photoId },
    data: { storagePath: relPath, cdnUrl: newCdnUrl },
  })

  return NextResponse.json({ ok: true, cdnUrl: newCdnUrl })
}
