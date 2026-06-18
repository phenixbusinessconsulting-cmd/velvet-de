import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { LoginForm } from "@/components/features/auth/login-form"
import { getLocale, getMessages } from "@/lib/locale"

export const metadata: Metadata = {
  title: "Anmelden / Se connecter",
  description: "Melden Sie sich in Ihrem VELVET-Konto an.",
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams
  const locale = await getLocale()
  const t = await getMessages(locale)
  const a = t.auth

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 30% 50%, rgba(201,169,110,0.04) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 70% 50%, rgba(12,21,32,0.6) 0%, transparent 60%),
              var(--noir)
            `,
          }}
        />

        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="divider-gold mb-8" />
            <p className="label-luxury mb-3">{a.loginSubtitle}</p>
            <h1 className="text-3xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
              {a.loginTitle}
            </h1>
          </div>

          <div className="card-luxury p-7 sm:p-8">
            <LoginForm redirectTo={next} />
          </div>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            {a.loginNoAccount}{" "}
            <Link href="/registrieren" className="text-[var(--gold)] hover:underline transition-colors">
              {a.loginRegisterLink}
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
