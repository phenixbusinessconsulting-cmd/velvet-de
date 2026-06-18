import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { prisma } from "@/lib/prisma"
import { unlink } from "fs/promises"
import { join } from "path"

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

  const { videoId } = await req.json()
  if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 })

  const video = await prisma.video.findUnique({ where: { id: videoId } })
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.video.delete({ where: { id: videoId } })
  await unlink(join(process.cwd(), "public", video.storagePath)).catch(() => {})

  return NextResponse.json({ success: true })
}
