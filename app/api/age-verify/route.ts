import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashIp } from "@/lib/utils"

// LEGAL NOTE (DE): Jugendschutzgesetz (JuSchG) §4 — age verification
// This is a basic cookie-based gate. For production, integrate a certified
// age verification provider (e.g., Verimi, IDnow, or similar DE-approved service)

const schema = z.object({ confirmed: z.literal(true) })

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Bestätigung erforderlich" }, { status: 400 })
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const ipHash = await hashIp(ip)

  // Log consent (DSGVO Art. 7)
  await prisma.consentLog.create({
    data: {
      consentType: "AGE_VERIFICATION",
      granted: true,
      version: "2025-01-01",
      ipHash,
      userAgent: req.headers.get("user-agent") ?? undefined,
    },
  }).catch(() => {})

  const response = NextResponse.json({ success: true })
  response.cookies.set("age_verified", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: "/",
  })

  return response
}
