import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { COUNTRY_COOKIE } from "@/lib/country"

const schema = z.object({ slug: z.string().min(1).max(80) })

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Pays invalide" }, { status: 400 })
  }

  // Le pays doit exister et être actif
  const country = await prisma.country.findFirst({
    where: { slug: parsed.data.slug, isActive: true },
    select: { slug: true },
  })
  if (!country) {
    return NextResponse.json({ error: "Pays introuvable" }, { status: 404 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(COUNTRY_COOKIE, country.slug, {
    httpOnly: false, // lisible côté client pour le sélecteur du header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  })
  return response
}
