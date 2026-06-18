import { cookies } from "next/headers"

export type Locale = "de" | "fr"

export async function getLocale(): Promise<Locale> {
  const jar = await cookies()
  const val = jar.get("velvet_lang")?.value
  // French by default — only switch to DE when explicitly chosen
  return val === "de" ? "de" : "fr"
}

export async function getMessages(locale: Locale) {
  return locale === "fr"
    ? (await import("@/messages/fr")).default
    : (await import("@/messages/de")).default
}
