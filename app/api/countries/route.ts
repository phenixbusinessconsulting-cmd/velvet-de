import { NextResponse } from "next/server"
import { getActiveCountries } from "@/lib/country"

// Liste publique des pays actifs (pour le sélecteur du header)
export async function GET() {
  const countries = await getActiveCountries()
  return NextResponse.json(
    countries.map((c) => ({ slug: c.slug, nameDE: c.nameDE, nameEN: c.nameEN, flag: c.flag }))
  )
}
