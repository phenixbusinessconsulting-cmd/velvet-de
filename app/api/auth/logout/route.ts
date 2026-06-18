import { NextResponse, type NextRequest } from "next/server"
import { verifySessionToken, invalidateSession } from "@/lib/auth"
import { audit } from "@/lib/audit"

export async function POST(req: NextRequest) {
  const token = req.cookies.get("velvet_session")?.value

  if (token) {
    const payload = await verifySessionToken(token)
    if (payload) {
      await invalidateSession(token)
      await audit({ userId: payload.sub, action: "USER_LOGOUT" })
    }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete("velvet_session")
  return response
}
