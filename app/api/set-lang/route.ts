import { NextResponse, type NextRequest } from "next/server"
import type { Locale } from "@/lib/locale"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const locale: Locale = body?.locale === "fr" ? "fr" : "de"

  const response = NextResponse.json({ success: true, locale })
  response.cookies.set("velvet_lang", locale, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  })

  return response
}
