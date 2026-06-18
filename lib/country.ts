import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const COUNTRY_COOKIE = "velvet_country"

export interface PublicCountry {
  id: string
  code: string
  slug: string
  nameDE: string
  nameEN: string
  flag: string | null
}

const SELECT = { id: true, code: true, slug: true, nameDE: true, nameEN: true, flag: true } as const

/** Pays actifs, triés par priorité (sortOrder). */
export async function getActiveCountries(): Promise<PublicCountry[]> {
  return prisma.country.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameDE: "asc" }],
    select: SELECT,
  })
}

/** Pays choisi par le visiteur (cookie), ou null. */
export async function getSelectedCountry(): Promise<PublicCountry | null> {
  const jar = await cookies()
  const slug = jar.get(COUNTRY_COOKIE)?.value
  if (!slug) return null
  return prisma.country.findFirst({ where: { slug, isActive: true }, select: SELECT })
}

/**
 * À utiliser en tête des pages publiques scopées par pays.
 * - S'il existe des pays actifs et qu'aucun n'est choisi → redirige vers la country gate.
 * - S'il n'existe aucun pays actif → ne bloque pas (retourne null), le site reste ouvert.
 * Retourne le pays sélectionné (ou null si aucun pays configuré).
 */
export async function requireCountry(nextPath: string): Promise<PublicCountry | null> {
  const [selected, active] = await Promise.all([getSelectedCountry(), getActiveCountries()])
  if (!selected && active.length > 0) {
    redirect(`/?country_gate=1&next=${encodeURIComponent(nextPath)}`)
  }
  return selected
}
