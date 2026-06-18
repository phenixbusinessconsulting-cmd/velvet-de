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

export async function updateCity(id: string, data: {
  nameDE?: string
  nameEN?: string
  slug?: string
  state?: string
  stateCode?: string
  sortOrder?: number
  isActive?: boolean
  showOnLanding?: boolean
  taglineDE?: string | null
  taglineFR?: string | null
}) {
  await assertAdmin()
  await prisma.city.update({ where: { id }, data })
  revalidatePath("/admin/staedte")
  revalidatePath("/", "layout")
}

export async function createCity(data: {
  nameDE: string
  nameEN: string
  slug: string
  state: string
  stateCode: string
  sortOrder: number
  isActive: boolean
  showOnLanding: boolean
  taglineDE: string | null
  taglineFR: string | null
}) {
  await assertAdmin()
  await prisma.city.create({ data })
  revalidatePath("/admin/staedte")
  revalidatePath("/", "layout")
}

export async function deleteCity(id: string) {
  await assertAdmin()
  const count = await prisma.professionalProfile.count({ where: { cityId: id } })
  if (count > 0) throw new Error(`Cannot delete: ${count} profile(s) assigned to this city`)
  await prisma.city.delete({ where: { id } })
  revalidatePath("/admin/staedte")
  revalidatePath("/", "layout")
}

export async function reorderCities(items: { id: string; sortOrder: number }[]) {
  await assertAdmin()
  await Promise.all(
    items.map(({ id, sortOrder }) =>
      prisma.city.update({ where: { id }, data: { sortOrder } })
    )
  )
  revalidatePath("/admin/staedte")
  revalidatePath("/", "layout")
}
