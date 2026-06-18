import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

// ─── Route classification ────────────────────────────────────────────────────

// Public routes — no auth required, but age gate applies
const PUBLIC_ROUTES = [
  "/",
  "/verzeichnis",
  "/suche",
  "/vertrauen",
  "/faq",
  "/kontakt",
  "/impressum",
  "/datenschutz",
  "/agb",
  "/compliance",
]
const PUBLIC_PREFIXES = ["/verzeichnis/", "/profil/"]

// Auth routes — redirect to dashboard if already logged in
const AUTH_ROUTES = ["/anmelden", "/registrieren"]

// Protected — requires authenticated session
const PROFESSIONAL_PREFIX = "/dashboard"
const ADMIN_PREFIX = "/admin"

// Routes that bypass age gate (legal pages must always be accessible)
const AGE_GATE_BYPASS = ["/impressum", "/datenschutz", "/agb", "/api/"]

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-me")

// ─── Middleware ─────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Always add pathname header for layouts
  response.headers.set("x-pathname", pathname)

  // Skip static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff2?)$/)
  ) {
    return response
  }

  // ── 1. Age verification gate ─────────────────────────────────────────────
  // LEGAL NOTE (DE): Jugendschutzgesetz — 18+ verification required
  const ageVerified = request.cookies.get("age_verified")?.value === "1"
  const bypassAgeGate = AGE_GATE_BYPASS.some((p) => pathname.startsWith(p))

  if (!ageVerified && !bypassAgeGate) {
    if (pathname !== "/" && !pathname.startsWith("/api/age-verify")) {
      // Store intended destination for post-verification redirect
      const url = request.nextUrl.clone()
      url.pathname = "/"
      url.searchParams.set("age_gate", "1")
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  // ── 2. Auth token extraction ─────────────────────────────────────────────
  const token = request.cookies.get("velvet_session")?.value
  let userId: string | null = null
  let userRole: string | null = null

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      userId = payload.sub ?? null
      userRole = (payload.role as string) ?? null
    } catch {
      // Invalid/expired token — clear it
      const res = NextResponse.next()
      res.cookies.delete("velvet_session")
      return res
    }
  }

  // ── 3. Redirect logged-in users away from auth pages ────────────────────
  if (userId && AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // ── 4. Protect professional dashboard ───────────────────────────────────
  if (pathname.startsWith(PROFESSIONAL_PREFIX)) {
    if (!userId) {
      const url = new URL("/anmelden", request.url)
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
    if (userRole !== "PROFESSIONAL" && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // ── 5. Protect admin panel ───────────────────────────────────────────────
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!userId || !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Pass userId/role to headers for server components
  if (userId) {
    response.headers.set("x-user-id", userId)
    response.headers.set("x-user-role", userRole ?? "")
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
