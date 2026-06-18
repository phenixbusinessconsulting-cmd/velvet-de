import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Camera, FileText, BarChart2, LogOut, Shield } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { getLocale, getMessages } from "@/lib/locale"

export default async function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const userId   = headersList.get("x-user-id")
  const userRole = headersList.get("x-user-role")

  if (!userId) redirect("/anmelden?next=/dashboard")

  const locale = await getLocale()
  const t = await getMessages(locale)
  const n = t.professionalNav

  const isAdmin = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole ?? "")

  const NAV = [
    { href: "/dashboard",            icon: LayoutDashboard, label: n.overview },
    { href: "/dashboard/profil",     icon: FileText,        label: n.myProfile },
    { href: "/dashboard/fotos",      icon: Camera,          label: n.photos },
    { href: "/dashboard/dokumente",  icon: Shield,          label: n.documents },
    { href: "/dashboard/statistik",  icon: BarChart2,       label: n.statistics },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[var(--surface)] border-r border-[var(--border)] fixed inset-y-0 z-30">
        <div className="p-5 border-b border-[var(--border)]">
          <Logo size="xs" />
        </div>

        <nav className="flex-1 p-3 space-y-1">
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

        <div className="p-3 border-t border-[var(--border)] space-y-1">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--r-lg)] text-sm text-[var(--gold)] hover:bg-[var(--gold-muted)] transition-all duration-[200ms]"
            >
              <Shield className="w-4 h-4" />
              {n.adminPanel}
            </Link>
          )}
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

      {/* Main content */}
      <main className="flex-1 lg:ml-56">
        {children}
      </main>
    </div>
  )
}
