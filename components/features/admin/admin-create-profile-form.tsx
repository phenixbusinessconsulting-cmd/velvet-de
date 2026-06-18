"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface City {
  id: string
  nameDE: string
}

interface Props {
  cities: City[]
  createProfile: (formData: FormData) => Promise<{ error?: string; id?: string }>
}

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function AdminCreateProfileForm({ cities, createProfile }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [slug, setSlug] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const fd = new FormData(e.currentTarget)
    const result = await createProfile(fd)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.id) {
      router.push(`/admin/profile/${result.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Account */}
      <div className="card-luxury p-6 space-y-4">
        <h2 className="text-base font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
          Compte
        </h2>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            Email *
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            Mot de passe *
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Profile */}
      <div className="card-luxury p-6 space-y-4">
        <h2 className="text-base font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
          Profil
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
              Nom d'affichage *
            </label>
            <input
              name="displayName"
              type="text"
              required
              maxLength={60}
              onChange={(e) => setSlug(toSlug(e.target.value))}
              className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
              Âge *
            </label>
            <input
              name="age"
              type="number"
              required
              min={18}
              max={99}
              className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            Slug (URL) *
          </label>
          <input
            name="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] font-mono focus:border-[var(--gold)] focus:outline-none transition-colors"
          />
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            URL publique : /profil/<span className="text-[var(--gold)]">{slug || "..."}</span>
          </p>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            Ville *
          </label>
          <select
            name="cityId"
            required
            className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
          >
            <option value="">— Sélectionner —</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.nameDE}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            Tagline
          </label>
          <input
            name="tagline"
            type="text"
            maxLength={120}
            className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-[var(--error)] px-1">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="surface" size="sm" onClick={() => router.back()} disabled={loading}>
          Annuler
        </Button>
        <Button type="submit" variant="gold" size="sm" disabled={loading}>
          {loading ? (
            <><span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin mr-1.5" />Création...</>
          ) : (
            "Créer le profil"
          )}
        </Button>
      </div>
    </form>
  )
}
