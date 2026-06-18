"use client"

import { createContext, useContext } from "react"
import type { Locale } from "@/lib/locale"
import type { Messages } from "@/messages/de"
import de from "@/messages/de"

interface LocaleContextValue {
  locale: Locale
  t: Messages
}

const LocaleContext = createContext<LocaleContextValue>({ locale: "de", t: de })

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: React.ReactNode
}) {
  return (
    <LocaleContext.Provider value={{ locale, t: messages }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
