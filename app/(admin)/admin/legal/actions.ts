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

export async function upsertLegalPage(data: {
  slug: string
  titleDE: string
  titleFR: string
  contentDE: string
  contentFR: string
}) {
  await assertAdmin()
  await prisma.legalPage.upsert({
    where:  { slug: data.slug },
    update: {
      titleDE:   data.titleDE,
      titleFR:   data.titleFR,
      contentDE: data.contentDE,
      contentFR: data.contentFR,
    },
    create: {
      slug:      data.slug,
      titleDE:   data.titleDE,
      titleFR:   data.titleFR,
      contentDE: data.contentDE,
      contentFR: data.contentFR,
    },
  })
  revalidatePath(`/admin/legal`)
  revalidatePath(`/admin/legal/${data.slug}`)
  // Revalidate the corresponding public pages
  revalidatePath(`/${data.slug}`)
}
