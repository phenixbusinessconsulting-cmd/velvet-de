import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import {
  verifyPassword,
  createSessionToken,
  createSession,
  checkRateLimit,
} from "@/lib/auth"
import { audit } from "@/lib/audit"
import { hashIp } from "@/lib/utils"

const schema = z.object({
  email:      z.string().email(),
  password:   z.string().min(1),
  redirectTo: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const ua = req.headers.get("user-agent") ?? ""
  const ipHash = await hashIp(ip)

  // Rate limiting — 5 attempts / 15 min per IP
  const { allowed } = await checkRateLimit(ipHash, "login", 5, 900)
  if (!allowed) {
    return NextResponse.json(
      { error: "Zu viele Anmeldeversuche. Bitte in 15 Minuten erneut versuchen." },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 })
  }

  const { email, password, redirectTo = "/dashboard" } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.passwordHash) {
    await audit({ action: "USER_LOGIN_FAILED", metadata: { email }, ipAddress: ip })
    return NextResponse.json({ error: "E-Mail oder Passwort falsch" }, { status: 401 })
  }

  if (user.isBlocked) {
    return NextResponse.json(
      { error: "Dieses Konto wurde gesperrt. Bitte kontaktieren Sie den Support." },
      { status: 403 }
    )
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    await audit({ userId: user.id, action: "USER_LOGIN_FAILED", ipAddress: ip })
    return NextResponse.json({ error: "E-Mail oder Passwort falsch" }, { status: 401 })
  }

  // Create session
  const token = await createSessionToken(user.id, user.email, user.role)
  await createSession(user.id, token, ip, ua)

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), lastLoginIp: ip },
  })

  await audit({ userId: user.id, action: "USER_LOGIN", ipAddress: ip })

  const response = NextResponse.json({ success: true, redirectTo })
  response.cookies.set("velvet_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  })

  return response
}
