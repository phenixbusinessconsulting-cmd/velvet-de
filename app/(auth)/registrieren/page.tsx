import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { RegisterForm } from "@/components/features/auth/register-form"
import { getLocale, getMessages } from "@/lib/locale"

export const metadata: Metadata = {
  title: "Registrieren / S'inscrire",
  description: "Erstellen Sie Ihr VELVET-Profil als verifizierte Begleitperson.",
  robots: { index: false, follow: false },
}

export default async function RegisterPage() {
  const locale = await getLocale()
  const t = await getMessages(locale)
  const a = t.auth

  return (
    <>
      <Header />
      <main className="min-h-screen px-4 py-24">
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 30% 30%, rgba(201,169,110,0.04) 0%, transparent 60%), var(--noir)`,
          }}
        />

        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <div className="divider-gold mb-8" />
            <p className="label-luxury mb-3">{a.registerSubtitle}</p>
            <h1 className="text-3xl font-light text-[var(--pearl)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              {a.registerTitle}
            </h1>
          </div>

          <div className="card-luxury p-7 sm:p-8">
            <RegisterForm />
          </div>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            {a.registerHaveAccount}{" "}
            <Link href="/anmelden" className="text-[var(--gold)] hover:underline">
              {a.registerLoginLink}
            </Link>
          </p>
          <p className="text-center text-xs text-[var(--text-muted)] mt-3 leading-relaxed">
            {a.checkTerms.split("CGU")[0]}
            <Link href="/agb" target="_blank" className="hover:text-[var(--gold)] transition-colors">{a.checkTerms}</Link>
            {" "}{a.checkPrivacy.split("la")[0]}
            <Link href="/datenschutz" target="_blank" className="hover:text-[var(--gold)] transition-colors">{a.checkPrivacy}</Link>.
          </p>
        </div>
      </main>
    </>
  )
}
