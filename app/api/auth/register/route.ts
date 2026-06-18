import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import {
  hashPassword,
  validatePasswordStrength,
  createSessionToken,
  createSession,
  checkRateLimit,
} from "@/lib/auth"
import { audit } from "@/lib/audit"
import { slugify, hashIp } from "@/lib/utils"

const schema = z.object({
  displayName: z.string().min(2).max(60),
  email:       z.string().email(),
  password:    z.string().min(8),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const ua = req.headers.get("user-agent") ?? ""
  const ipHash = await hashIp(ip)

  // Rate limiting — 3 registrations / hour per IP
  const { allowed } = await checkRateLimit(ipHash, "register", 3, 3600)
  if (!allowed) {
    return NextResponse.json(
      { error: "Zu viele Registrierungsversuche. Bitte später erneut versuchen." },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 })
  }

  const { displayName, email, password } = parsed.data

  // Password strength
  const pwError = validatePasswordStrength(password)
  if (pwError) return NextResponse.json({ error: pwError }, { status: 400 })

  // Check email uniqueness
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: "Diese E-Mail-Adresse ist bereits registriert." },
      { status: 409 }
    )
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "PROFESSIONAL",
      ageVerified: true, // confirmed by age gate
    },
  })

  // Create empty professional profile
  const slug = `${slugify(displayName)}-${user.id.slice(-6)}`
  await prisma.professionalProfile.create({
    data: {
      userId: user.id,
      displayName,
      age: 25, // placeholder — must be updated in profile setup
      cityId: "berlin", // placeholder
      slug,
      status: "DRAFT",
      kycStatus: "PENDING",
    },
  })

  await audit({ userId: user.id, action: "USER_REGISTER", ipAddress: ip })

  const token = await createSessionToken(user.id, user.email, user.role)
  await createSession(user.id, token, ip, ua)

  const response = NextResponse.json({ success: true })
  response.cookies.set("velvet_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  })

  return response
}
