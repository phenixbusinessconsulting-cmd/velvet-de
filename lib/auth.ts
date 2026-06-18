import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
)
const SESSION_DURATION = 7 * 24 * 60 * 60 // 7 days in seconds

export interface SessionPayload {
  sub: string        // userId
  email: string
  role: UserRole
  iat: number
  exp: number
}

// ─── Token operations ────────────────────────────────────────────────────────

export async function createSessionToken(userId: string, email: string, role: UserRole) {
  return new SignJWT({ sub: userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET)
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// ─── Password utilities ──────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── Password requirements ───────────────────────────────────────────────────

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "Mindestens 8 Zeichen erforderlich"
  if (!/[A-Z]/.test(password)) return "Mindestens ein Großbuchstabe erforderlich"
  if (!/[0-9]/.test(password)) return "Mindestens eine Zahl erforderlich"
  if (!/[^A-Za-z0-9]/.test(password)) return "Mindestens ein Sonderzeichen erforderlich"
  return null
}

// ─── Session creation (DB) ───────────────────────────────────────────────────

export async function createSession(
  userId: string,
  token: string,
  ipAddress?: string,
  userAgent?: string
) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000)
  return prisma.session.create({
    data: { userId, token, expiresAt, ipAddress, userAgent },
  })
}

export async function invalidateSession(token: string) {
  await prisma.session.deleteMany({ where: { token } })
}

export async function invalidateAllUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } })
}

// ─── Rate limiting helper ────────────────────────────────────────────────────

export async function checkRateLimit(
  identifier: string,
  action: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowSeconds * 1000)

  // Check existing record first to handle window resets
  const existing = await prisma.rateLimit.findUnique({
    where: { identifier_action: { identifier, action } },
  })

  const record = await prisma.rateLimit.upsert({
    where: { identifier_action: { identifier, action } },
    create: { identifier, action, attempts: 1, resetAt },
    update: existing && existing.resetAt < now
      ? { attempts: 1, resetAt }
      : { attempts: { increment: 1 } },
  })

  const allowed = record.attempts <= maxAttempts
  const remaining = Math.max(0, maxAttempts - record.attempts)

  if (!allowed && !record.blockedAt) {
    await prisma.rateLimit.update({
      where: { identifier_action: { identifier, action } },
      data: { blockedAt: now },
    })
  }

  return { allowed, remaining }
}
