import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Users, Flag, Shield, ScrollText,
  BarChart2, LogOut, Settings, MapPin, FileText
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { getLocale, getMessages } from "@/lib/locale"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const userRole = headersList.get("x-user-role")

  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")) {
    redirect("/")
  }

  const locale = await getLocale()
  const t = await getMessages(locale)
  const n = t.adminNav

  const NAV = [
    { href: "/admin",                  icon: LayoutDashboard, label: n.overview },
    { href: "/admin/profile",          icon: Users,           label: n.profiles },
    { href: "/admin/meldungen",        icon: Flag,            label: n.reports },
    { href: "/admin/verifizierungen",  icon: Shield,          label: n.verifications },
    { href: "/admin/bewertungen",      icon: BarChart2,       label: n.reviews },
    { href: "/admin/staedte",          icon: MapPin,          label: n.cities },
    { href: "/admin/legal",            icon: FileText,        label: n.legalPages },
    { href: "/admin/logs",             icon: ScrollText,      label: n.auditLogs },
    { href: "/admin/einstellungen",    icon: Settings,        label: n.settings },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Admin sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[var(--noir)] border-r border-[var(--border-gold)] fixed inset-y-0 z-30">
        <div className="p-5 border-b border-[var(--border)]">
          <Logo size="xs" />
          <p className="text-[9px] tracking-[0.2em] uppercase text-[var(--gold)] mt-2 ml-0.5">
            Administration
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--r-lg)] text-sm text-[var(--text-muted)] hover:text-[var(--pearl)] hover:bg-[var(--surface-3)] transition-all duration-[200ms]"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--r-lg)] text-sm text-[var(--text-muted)] hover:text-[var(--pearl)] hover:bg-[var(--surface-3)] transition-all duration-[200ms] mb-1"
          >
            {n.proDashboard}
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--r-lg)] text-sm text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error)]/5 transition-all duration-[200ms]"
            >
              <LogOut className="w-4 h-4" />
              {n.logout}
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 lg:ml-60 bg-[var(--surface)]">
        {children}
      </main>
    </div>
  )
}
