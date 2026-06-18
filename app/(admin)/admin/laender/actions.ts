"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

async function assertAdmin() {
  const h = await headers()
  const role = h.get("x-user-role") ?? ""
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role)) {
    throw new Error("Unauthorized")
  }
}

export async function createCountry(data: {
  code: string
  nameDE: string
  nameEN: string
  slug: string
  flag: string | null
  sortOrder: number
  isActive: boolean
}) {
  await assertAdmin()
  await prisma.country.create({
    data: { ...data, code: data.code.toUpperCase() },
  })
  revalidatePath("/admin/laender")
  revalidatePath("/admin/staedte")
  revalidatePath("/", "layout")
}

export async function updateCountry(id: string, data: {
  code?: string
  nameDE?: string
  nameEN?: string
  slug?: string
  flag?: string | null
  sortOrder?: number
  isActive?: boolean
}) {
  await assertAdmin()
  await prisma.country.update({
    where: { id },
    data: data.code ? { ...data, code: data.code.toUpperCase() } : data,
  })
  revalidatePath("/admin/laender")
  revalidatePath("/admin/staedte")
  revalidatePath("/", "layout")
}

export async function deleteCountry(id: string) {
  await assertAdmin()
  const count = await prisma.city.count({ where: { countryId: id } })
  if (count > 0) throw new Error(`Impossible de supprimer : ${count} ville(s) rattachée(s) à ce pays`)
  await prisma.country.delete({ where: { id } })
  revalidatePath("/admin/laender")
  revalidatePath("/", "layout")
}

export async function reorderCountries(items: { id: string; sortOrder: number }[]) {
  await assertAdmin()
  await Promise.all(
    items.map(({ id, sortOrder }) =>
      prisma.country.update({ where: { id }, data: { sortOrder } })
    )
  )
  revalidatePath("/admin/laender")
  revalidatePath("/", "layout")
}
