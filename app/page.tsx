import { cookies } from "next/headers"
import Link from "next/link"
import { ChevronRight, Shield, Star, Lock, CheckCircle2 } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AgeGate } from "@/components/layout/age-gate"
import { CountryGate } from "@/components/layout/country-gate"
import { CookieBanner } from "@/components/layout/cookie-banner"
import { Button } from "@/components/ui/button"
import { getLocale, getMessages } from "@/lib/locale"
import { getActiveCountries, getSelectedCountry } from "@/lib/country"

const TRUST_ICONS = [Shield, Lock, CheckCircle2, Star]

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ age_gate?: string; country_gate?: string }>
}) {
  const cookieStore = await cookies()
  const ageVerified = cookieStore.get("age_verified")?.value === "1"
  const params = await searchParams
  const showAgeGate = !ageVerified || params.age_gate === "1"

  // Country gate : après l'âge, si des pays actifs existent et qu'aucun n'est choisi
  const [activeCountries, selectedCountry] = await Promise.all([
    getActiveCountries(),
    getSelectedCountry(),
  ])
  const showCountryGate =
    !showAgeGate &&
    activeCountries.length > 0 &&
    (!selectedCountry || params.country_gate === "1")

  const showGate = showAgeGate || showCountryGate

  const locale = await getLocale()
  const t = await getMessages(locale)
  const l = t.landing

  return (
    <>
      {showAgeGate && <AgeGate />}
      {showCountryGate && <CountryGate countries={activeCountries} />}

      <div className={showGate ? "blur-sm pointer-events-none select-none" : ""}>
        <Header />

        {/* HERO */}
        <section className="relative min-h-[100dvh] flex flex-col">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,169,110,0.08) 0%, transparent 60%),
                  radial-gradient(ellipse 60% 80% at 80% 100%, rgba(12,21,32,0.9) 0%, transparent 70%),
                  linear-gradient(180deg, #08080E 0%, #0C1520 40%, #0F0F1A 100%)
                `,
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: `linear-gradient(var(--border-gold) 1px, transparent 1px),
                                  linear-gradient(90deg, var(--border-gold) 1px, transparent 1px)`,
                backgroundSize: "80px 80px",
              }}
            />
          </div>

          <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-20">
            <div className="animate-fadeInUp mb-8">
              <span className="label-luxury">{l.label}</span>
            </div>

            <h1
              className="animate-fadeInUp animate-delay-100 heading-luxury text-[clamp(2.5rem,8vw,5.5rem)] text-[var(--pearl)] max-w-4xl mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {l.heroTitle1}{" "}
              <span className="gradient-gold-text italic">{l.heroTitleHighlight}</span>
            </h1>

            <p className="animate-fadeInUp animate-delay-200 text-lg sm:text-xl text-[var(--text-secondary)] max-w-xl mb-10 leading-relaxed">
              {l.heroSubtitle}
            </p>

            <div className="animate-fadeInUp animate-delay-300 flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild variant="gold" size="xl">
                <Link href="/verzeichnis" className="flex items-center gap-2">
                  {l.ctaDirectory}
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="gold-outline" size="xl">
                <Link href="/registrieren">{l.ctaPro}</Link>
              </Button>
            </div>

            <div className="animate-fadeInUp animate-delay-400 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
              {l.badges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fadeIn animate-delay-500">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)]">{l.scrollHint}</span>
              <div className="w-px h-8 bg-gradient-to-b from-[var(--border-gold)] to-transparent" />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 px-4 bg-[var(--surface)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="label-luxury mb-3">{l.processLabel}</p>
              <h2
                className="heading-luxury text-4xl sm:text-5xl text-[var(--pearl)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {l.processTitle}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {l.processSteps.map((item) => (
                <div key={item.step} className="card-luxury p-8 text-center">
                  <div className="text-4xl mb-5">{item.icon}</div>
                  <p className="text-5xl font-light text-[var(--border-strong)] mb-4" style={{ fontFamily: "var(--font-display)" }}>
                    {item.step}
                  </p>
                  <h3 className="text-xl font-light text-[var(--pearl)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="label-luxury mb-3">{l.trustLabel}</p>
              <h2
                className="heading-luxury text-4xl sm:text-5xl text-[var(--pearl)] max-w-2xl mx-auto"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {l.trustTitle}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {l.trustPoints.map((point, i) => {
                const Icon = TRUST_ICONS[i]
                return (
                  <div key={point.title} className="card-luxury p-7">
                    <div className="w-12 h-12 rounded-[var(--r-xl)] bg-[var(--gold-muted)] border border-[var(--border-gold)] flex items-center justify-center mb-5">
                      <Icon className="w-5 h-5 text-[var(--gold)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-light text-[var(--pearl)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
                      {point.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{point.desc}</p>
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-10">
              <Button asChild variant="gold-outline" size="lg">
                <Link href="/vertrauen">{l.trustMore}</Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
        <CookieBanner />
      </div>
    </>
  )
}
