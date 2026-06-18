import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Settings, MapPin, Shield, ScrollText, Globe } from "lucide-react"
import Link from "next/link"

export default async function AdminSettingsPage() {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) redirect("/")

  const sections = [
    {
      icon: MapPin,
      title: "Villes",
      desc: "Gérer les villes, taglines, ordre d'affichage et visibilité sur la page d'accueil.",
      href: "/admin/staedte",
      label: "Gérer les villes",
    },
    {
      icon: Shield,
      title: "Conformité DSGVO",
      desc: "Politique de rétention, gestion des consentements, droits à l'effacement.",
      href: null,
      label: "Bientôt disponible",
    },
    {
      icon: Globe,
      title: "Contenu bloqué",
      desc: "Mots et expressions bloqués dans les descriptions de profils.",
      href: null,
      label: "Bientôt disponible",
    },
    {
      icon: ScrollText,
      title: "Export audit",
      desc: "Exporter les logs d'audit conformément à l'Art. 30 DSGVO.",
      href: "/admin/logs",
      label: "Voir les logs",
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-luxury mb-2">Admin · Configuration</p>
          <h1 className="text-3xl font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
            Paramètres
          </h1>
        </div>
        <Settings className="w-8 h-8 text-[var(--gold)]/30" />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {sections.map(({ icon: Icon, title, desc, href, label }) => (
          <div key={title} className="card-luxury p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[var(--r-xl)] bg-[var(--gold-muted)] border border-[var(--border-gold)] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[var(--gold)]" strokeWidth={1.5} />
              </div>
              <h2 className="text-base font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
                {title}
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
            {href ? (
              <Link
                href={href}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--r-lg)] border border-[var(--border-gold)] text-[var(--gold)] text-sm hover:bg-[var(--gold-muted)] transition-colors"
              >
                {label}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--r-lg)] border border-[var(--border)] text-[var(--text-muted)] text-sm cursor-not-allowed">
                {label}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="card-luxury p-6 border border-[var(--border-gold)]/30">
        <h2 className="text-base font-light text-[var(--pearl)] mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Informations système
        </h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          {[
            ["Version", "1.0.0"],
            ["Environnement", "Production"],
            ["Base de données", "PostgreSQL 15"],
            ["Conformité", "DSGVO + ProstSchG"],
            ["Stockage médias", "CDN externe"],
            ["Auth", "JWT sessions"],
          ].map(([label, val]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
              <span className="text-[var(--text-secondary)]">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
