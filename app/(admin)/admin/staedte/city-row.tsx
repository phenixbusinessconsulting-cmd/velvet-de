"use client"

import { useState, useTransition, useEffect } from "react"
import { Pencil, Trash2, Check, X, Loader2, Eye, EyeOff, Globe, Globe2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateCity, deleteCity } from "./actions"

interface CountryOption {
  id: string
  nameDE: string
  flag: string | null
}

interface CityRowProps {
  city: {
    id: string
    nameDE: string
    nameEN: string
    slug: string
    state: string
    stateCode: string
    sortOrder: number
    isActive: boolean
    showOnLanding: boolean
    taglineDE: string | null
    taglineFR: string | null
    countryId: string | null
    _count: { profiles: number }
  }
  countries: CountryOption[]
  inSortable?: boolean
}

export function CityRow({ city, countries, inSortable }: CityRowProps) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    nameDE: city.nameDE,
    nameEN: city.nameEN,
    slug: city.slug,
    state: city.state,
    stateCode: city.stateCode,
    sortOrder: city.sortOrder,
    isActive: city.isActive,
    showOnLanding: city.showOnLanding,
    taglineDE: city.taglineDE ?? "",
    taglineFR: city.taglineFR ?? "",
    countryId: city.countryId ?? "",
  })

  // Sync form state when server re-renders with fresh city data
  useEffect(() => {
    setForm({
      nameDE: city.nameDE,
      nameEN: city.nameEN,
      slug: city.slug,
      state: city.state,
      stateCode: city.stateCode,
      sortOrder: city.sortOrder,
      isActive: city.isActive,
      showOnLanding: city.showOnLanding,
      taglineDE: city.taglineDE ?? "",
      taglineFR: city.taglineFR ?? "",
      countryId: city.countryId ?? "",
    })
  }, [city])

  const currentCountry = countries.find((c) => c.id === city.countryId)

  function handleSave() {
    startTransition(async () => {
      await updateCity(city.id, {
        ...form,
        taglineDE: form.taglineDE || null,
        taglineFR: form.taglineFR || null,
        countryId: form.countryId || null,
      })
      setEditing(false)
    })
  }

  function handleDelete() {
    if (!confirm(`Supprimer "${city.nameDE}" ? Cette action est irréversible.`)) return
    startTransition(async () => {
      try {
        await deleteCity(city.id)
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Erreur lors de la suppression")
      }
    })
  }

  function toggleActive() {
    startTransition(() => updateCity(city.id, { isActive: !city.isActive }))
  }

  function toggleLanding() {
    startTransition(() => updateCity(city.id, { showOnLanding: !city.showOnLanding }))
  }

  // --- editing cells ---
  const editingCells = (
    <>
      <td className="px-4 py-3">
        <Input
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          type="number"
          className="w-16 h-8 text-sm"
        />
      </td>
      <td className="px-4 py-3 space-y-1">
        <Input value={form.nameDE} onChange={(e) => setForm({ ...form, nameDE: e.target.value })} placeholder="Deutsch" className="h-8 text-sm" />
        <Input value={form.nameEN} onChange={(e) => setForm({ ...form, nameEN: e.target.value })} placeholder="English" className="h-8 text-sm" />
      </td>
      <td className="px-4 py-3">
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-8 text-sm font-mono" />
      </td>
      <td className="px-4 py-3">
        <select
          value={form.countryId}
          onChange={(e) => setForm({ ...form, countryId: e.target.value })}
          className="h-8 w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--surface-2)] px-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
        >
          <option value="">—</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>{c.flag ? `${c.flag} ` : ""}{c.nameDE}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 space-y-1">
        <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Bundesland" className="h-8 text-sm" />
        <Input value={form.stateCode} onChange={(e) => setForm({ ...form, stateCode: e.target.value })} placeholder="Code" className="h-8 text-sm w-20" maxLength={2} />
      </td>
      <td className="px-4 py-3 space-y-1">
        <Input value={form.taglineDE} onChange={(e) => setForm({ ...form, taglineDE: e.target.value })} placeholder="Tagline DE" className="h-8 text-sm" />
        <Input value={form.taglineFR} onChange={(e) => setForm({ ...form, taglineFR: e.target.value })} placeholder="Tagline FR" className="h-8 text-sm" />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[var(--gold)]" />
            <span className="text-[var(--text-secondary)]">Actif</span>
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={form.showOnLanding} onChange={(e) => setForm({ ...form, showOnLanding: e.target.checked })} className="accent-[var(--gold)]" />
            <span className="text-[var(--text-secondary)]">Accueil</span>
          </label>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{city._count.profiles}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button size="icon-sm" variant="gold" onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setEditing(false)} disabled={isPending}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </>
  )

  // --- display cells ---
  const displayCells = (
    <>
      <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{city.sortOrder}</td>
      <td className="px-4 py-3">
        <p className="text-sm text-[var(--text-primary)] font-medium">{city.nameDE}</p>
        <p className="text-xs text-[var(--text-muted)]">{city.nameEN}</p>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-3)] px-2 py-0.5 rounded">{city.slug}</span>
      </td>
      <td className="px-4 py-3">
        {currentCountry ? (
          <span className="text-xs text-[var(--text-secondary)]">{currentCountry.flag ? `${currentCountry.flag} ` : ""}{currentCountry.nameDE}</span>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-[var(--text-secondary)]">{city.state}</p>
        <p className="text-xs text-[var(--text-muted)]">{city.stateCode}</p>
      </td>
      <td className="px-4 py-3">
        {city.taglineDE && <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1"><Globe className="w-3 h-3 text-[var(--gold)]" />{city.taglineDE}</p>}
        {city.taglineFR && <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5"><Globe2 className="w-3 h-3 text-[var(--gold)]/60" />{city.taglineFR}</p>}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <button onClick={toggleActive} disabled={isPending} className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded transition-colors ${city.isActive ? "text-[var(--success)] bg-[var(--success)]/10" : "text-[var(--text-muted)] bg-[var(--surface-4)]"}`}>
            {city.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {city.isActive ? "Actif" : "Inactif"}
          </button>
          <button onClick={toggleLanding} disabled={isPending} className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded transition-colors ${city.showOnLanding ? "text-[var(--gold)] bg-[var(--gold-muted)]" : "text-[var(--text-muted)] bg-[var(--surface-4)]"}`}>
            ◆ {city.showOnLanding ? "Accueil" : "Masqué"}
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`text-sm font-light ${city._count.profiles > 0 ? "text-[var(--gold)]" : "text-[var(--text-muted)]"}`} style={{ fontFamily: "var(--font-display)" }}>
          {city._count.profiles}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button size="icon-sm" variant="surface" onClick={() => setEditing(true)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          {city._count.profiles === 0 && (
            <Button size="icon-sm" variant="ghost" onClick={handleDelete} disabled={isPending}>
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-[var(--error)]" />}
            </Button>
          )}
        </div>
      </td>
    </>
  )

  // When rendered inside SortableCityRow, the <tr> is already provided — just return cells
  if (inSortable) {
    return editing ? editingCells : displayCells
  }

  // Standalone usage: wrap in <tr>
  if (editing) {
    return (
      <tr className="border-b border-[var(--border)] bg-[var(--surface-3)]">
        {editingCells}
      </tr>
    )
  }

  return (
    <tr className="border-b border-[var(--border)] hover:bg-[var(--surface-3)] transition-colors">
      {displayCells}
    </tr>
  )
}
