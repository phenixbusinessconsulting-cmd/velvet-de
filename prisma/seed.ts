import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // ── Cities ──────────────────────────────────────────────────────────────────
  const cities = [
    { id: "berlin",      nameDE: "Berlin",      nameEN: "Berlin",      slug: "berlin",      state: "Berlin",              stateCode: "BE", sortOrder: 1,  showOnLanding: true,  taglineDE: "Hauptstadt der Diskretion",  taglineFR: "Capitale de la discrétion" },
    { id: "muenchen",    nameDE: "München",     nameEN: "Munich",      slug: "muenchen",    state: "Bayern",              stateCode: "BY", sortOrder: 2,  showOnLanding: true,  taglineDE: "Exzellenz aus Bayern",       taglineFR: "Excellence de Bavière" },
    { id: "hamburg",     nameDE: "Hamburg",     nameEN: "Hamburg",     slug: "hamburg",     state: "Hamburg",             stateCode: "HH", sortOrder: 3,  showOnLanding: true,  taglineDE: "Hansestadt Eleganz",         taglineFR: "Élégance hanséatique" },
    { id: "frankfurt",   nameDE: "Frankfurt",   nameEN: "Frankfurt",   slug: "frankfurt",   state: "Hessen",              stateCode: "HE", sortOrder: 4,  showOnLanding: true,  taglineDE: "Finance & Raffinement",      taglineFR: "Finance & Raffinement" },
    { id: "koeln",       nameDE: "Köln",        nameEN: "Cologne",     slug: "koeln",       state: "Nordrhein-Westfalen", stateCode: "NW", sortOrder: 5,  showOnLanding: true,  taglineDE: "Rheinische Lebensart",       taglineFR: "Art de vivre rhénan" },
    { id: "duesseldorf", nameDE: "Düsseldorf",  nameEN: "Düsseldorf",  slug: "duesseldorf", state: "Nordrhein-Westfalen", stateCode: "NW", sortOrder: 6,  showOnLanding: true,  taglineDE: "Mode & Prestige",            taglineFR: "Mode & Prestige" },
    { id: "stuttgart",   nameDE: "Stuttgart",   nameEN: "Stuttgart",   slug: "stuttgart",   state: "Baden-Württemberg",  stateCode: "BW", sortOrder: 7,  showOnLanding: true,  taglineDE: "Premium & Qualität",         taglineFR: "Premium & Qualité" },
    { id: "hannover",    nameDE: "Hannover",    nameEN: "Hanover",     slug: "hannover",    state: "Niedersachsen",      stateCode: "NI", sortOrder: 8,  showOnLanding: false, taglineDE: null,                         taglineFR: null },
  ]

  for (const city of cities) {
    await prisma.city.upsert({
      where: { id: city.id },
      create: city,
      update: city,
    })
  }
  console.log(`✅ ${cities.length} cities seeded`)

  // ── Blocked words ─────────────────────────────────────────────────────────
  const blockedWords = [
    { word: "minderjährig",  severity: 3 },
    { word: "minderjaehrig", severity: 3 },
    { word: "underage",      severity: 3 },
    { word: "minor",         severity: 3 },
    { word: "teen",          severity: 3 },
    { word: "child",         severity: 3 },
    { word: "kind",          severity: 3 },
  ]

  for (const bw of blockedWords) {
    await prisma.blockedWord.upsert({
      where: { word: bw.word },
      create: bw,
      update: bw,
    })
  }
  console.log(`✅ ${blockedWords.length} blocked words seeded`)

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL ?? "admin@velvet-companions.de"
  const adminPw    = process.env.ADMIN_INITIAL_PASSWORD ?? "ChangeMe!2025#"

  const adminHash = await bcrypt.hash(adminPw, 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      emailVerified: true,
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
      ageVerified: true,
    },
    update: {},
  })
  console.log(`✅ Admin user: ${adminEmail}`)

  console.log("✅ Seeding complete")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
