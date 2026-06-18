import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Slug generation ─────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// ─── Formatting ──────────────────────────────────────────────────────────────

export function formatDate(date: Date | string, locale = "de-DE"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then

  const minute = 60_000
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7

  if (diff < minute) return "Gerade eben"
  if (diff < hour) return `Vor ${Math.floor(diff / minute)} Min.`
  if (diff < day) return `Vor ${Math.floor(diff / hour)} Std.`
  if (diff < week) return `Vor ${Math.floor(diff / day)} Tagen`
  return formatDate(date)
}

// ─── IP hashing (DSGVO — no plaintext storage) ───────────────────────────────

export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + (process.env.IP_HASH_SALT ?? "velvet-salt"))
  const buffer = await crypto.subtle.digest("SHA-256", data)
  const array = Array.from(new Uint8Array(buffer))
  return array.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function isValidGermanAge(age: number): boolean {
  return age >= 18 && age <= 80
}

// ─── Blocked words check ─────────────────────────────────────────────────────

// Hard-coded critical words (DB-based list loaded separately)
const HARD_BLOCKED = [
  "minderjährig", "minor", "underage", "child", "kind", "jugend",
  "16", "17", "15", "14", "13",
]

export function containsBlockedWord(text: string, extraWords: string[] = []): boolean {
  const lower = text.toLowerCase()
  const allWords = [...HARD_BLOCKED, ...extraWords]
  return allWords.some((w) => lower.includes(w.toLowerCase()))
}

// ─── Profile status labels ───────────────────────────────────────────────────

export const PROFILE_STATUS_LABELS: Record<string, { de: string; fr: string; color: string }> = {
  DRAFT:          { de: "Entwurf",      fr: "Brouillon",          color: "#5A5248" },
  PENDING_REVIEW: { de: "In Prüfung",   fr: "En attente",         color: "#C9A640" },
  APPROVED:       { de: "Genehmigt",    fr: "Approuvé",           color: "#4E9B70" },
  SUSPENDED:      { de: "Gesperrt",     fr: "Suspendu",           color: "#C94A4A" },
  REJECTED:       { de: "Abgelehnt",    fr: "Refusé",             color: "#C94A4A" },
  ARCHIVED:       { de: "Archiviert",   fr: "Archivé",            color: "#5A5248" },
}

export const KYC_STATUS_LABELS: Record<string, { de: string; fr: string; color: string }> = {
  PENDING:             { de: "Ausstehend",           fr: "En attente",          color: "#5A5248" },
  DOCUMENTS_REQUESTED: { de: "Dokumente angefordert", fr: "Documents demandés", color: "#C9A640" },
  UNDER_REVIEW:        { de: "In Prüfung",            fr: "En cours",           color: "#4A7EC9" },
  APPROVED:            { de: "Verifiziert",           fr: "Vérifié",            color: "#4E9B70" },
  REJECTED:            { de: "Abgelehnt",             fr: "Refusé",             color: "#C94A4A" },
  EXPIRED:             { de: "Abgelaufen",            fr: "Expiré",             color: "#C94A4A" },
}

// ─── German cities ───────────────────────────────────────────────────────────

export const GERMAN_CITIES = [
  { id: "berlin",     nameDE: "Berlin",      nameEN: "Berlin",      slug: "berlin",     state: "Berlin",            stateCode: "BE" },
  { id: "muenchen",   nameDE: "München",     nameEN: "Munich",      slug: "muenchen",   state: "Bayern",            stateCode: "BY" },
  { id: "hamburg",    nameDE: "Hamburg",     nameEN: "Hamburg",     slug: "hamburg",    state: "Hamburg",           stateCode: "HH" },
  { id: "frankfurt",  nameDE: "Frankfurt",   nameEN: "Frankfurt",   slug: "frankfurt",  state: "Hessen",            stateCode: "HE" },
  { id: "koeln",      nameDE: "Köln",        nameEN: "Cologne",     slug: "koeln",      state: "Nordrhein-Westfalen", stateCode: "NW" },
  { id: "duesseldorf",nameDE: "Düsseldorf",  nameEN: "Düsseldorf",  slug: "duesseldorf",state: "Nordrhein-Westfalen", stateCode: "NW" },
  { id: "stuttgart",  nameDE: "Stuttgart",   nameEN: "Stuttgart",   slug: "stuttgart",  state: "Baden-Württemberg", stateCode: "BW" },
  { id: "duisburg",   nameDE: "Duisburg",    nameEN: "Duisburg",    slug: "duisburg",   state: "Nordrhein-Westfalen", stateCode: "NW" },
  { id: "hannover",   nameDE: "Hannover",    nameEN: "Hanover",     slug: "hannover",   state: "Niedersachsen",     stateCode: "NI" },
  { id: "nuernberg",  nameDE: "Nürnberg",    nameEN: "Nuremberg",   slug: "nuernberg",  state: "Bayern",            stateCode: "BY" },
] as const
