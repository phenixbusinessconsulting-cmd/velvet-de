import type { Metadata, Viewport } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import { Providers } from "@/components/providers"
import { LocaleProvider } from "@/context/locale"
import { getLocale, getMessages } from "@/lib/locale"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
})

export const metadata: Metadata = {
  title: {
    default: "Sexe6Annonces.com — Rencontres Discrètes Exclusives",
    template: "%s | Sexe6Annonces.com",
  },
  description:
    "La plateforme premium pour des rencontres discrètes et exclusives. Profils vérifiés, discrétion absolue.",
  keywords: [
    "sexe6annonces",
    "rencontres discrètes",
    "annonces adultes",
    "escort directory",
    "rencontres exclusives",
  ],
  authors: [{ name: "Sexe6Annonces.com" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Sexe6Annonces.com",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#08080E",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages(locale)

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${cormorant.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        <LocaleProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </LocaleProvider>
      </body>
    </html>
  )
}
