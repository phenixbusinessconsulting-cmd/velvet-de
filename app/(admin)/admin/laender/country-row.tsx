"use client"

import { useState, useTransition, useEffect } from "react"
import { Pencil, Trash2, Check, X, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateCountry, deleteCountry } from "./actions"

export interface CountryData {
  id: string
  code: string
  nameDE: string
  nameEN: string
  slug: string
  flag: string | null
  sortOrder: number
  isActive: boolean
  _count: { cities: number }
}

export function CountryRow({ country, inSortable }: { country: CountryData; inSortable?: boolean }) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    code: country.code,
    nameDE: country.nameDE,
    nameEN: country.nameEN,
    slug: country.slug,
    flag: country.flag ?? "",
    sortOrder: country.sortOrder,
    isActive: country.isActive,
  })

  useEffect(() => {
    setForm({
      code: country.code,
      nameDE: country.nameDE,
      nameEN: country.nameEN,
      slug: country.slug,
      flag: country.flag ?? "",
      sortOrder: country.sortOrder,
      isActive: country.isActive,
    })
  }, [country])

  function handleSave() {
    startTransition(async () => {
      await updateCountry(country.id, { ...form, flag: form.flag || null })
      setEditing(false)
    })
  }

  function handleDelete() {
    if (!confirm(`Supprimer "${country.nameDE}" ? Cette action est irréversible.`)) return
    startTransition(async () => {
      try {
        await deleteCountry(country.id)
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Erreur lors de la suppression")
      }
    })
  }

  function toggleActive() {
    startTransition(() => updateCountry(country.id, { isActive: !country.isActive }))
  }

  const editingCells = (
    <>
      <td className="px-4 py-3">
        <Input value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} type="number" className="w-16 h-8 text-sm" />
      </td>
      <td className="px-4 py-3">
        <Input value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })} placeholder="🇩🇪" maxLength={4} className="h-8 text-sm w-16 text-center" />
      </td>
      <td className="px-4 py-3 space-y-1">
        <Input value={form.nameDE} onChange={(e) => setForm({ ...form, nameDE: e.target.value })} placeholder="Deutsch" className="h-8 text-sm" />
        <Input value={form.nameEN} onChange={(e) => setForm({ ...form, nameEN: e.target.value })} placeholder="English" className="h-8 text-sm" />
      </td>
      <td className="px-4 py-3">
        <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="DE" maxLength={2} className="h-8 text-sm w-16 font-mono uppercase" />
      </td>
      <td className="px-4 py-3">
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} className="h-8 text-sm font-mono" />
      </td>
      <td className="px-4 py-3">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[var(--gold)]" />
          <span className="text-[var(--text-secondary)]">Actif</span>
        </label>
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{country._count.cities}</td>
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

  const displayCells = (
    <>
      <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{country.sortOrder}</td>
      <td className="px-4 py-3 text-xl text-center">{country.flag ?? "🏳️"}</td>
      <td className="px-4 py-3">
        <p className="text-sm text-[var(--text-primary)] font-medium">{country.nameDE}</p>
        <p className="text-xs text-[var(--text-muted)]">{country.nameEN}</p>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-3)] px-2 py-0.5 rounded">{country.code}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-3)] px-2 py-0.5 rounded">{country.slug}</span>
      </td>
      <td className="px-4 py-3">
        <button onClick={toggleActive} disabled={isPending} className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded transition-colors ${country.isActive ? "text-[var(--success)] bg-[var(--success)]/10" : "text-[var(--text-muted)] bg-[var(--surface-4)]"}`}>
          {country.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {country.isActive ? "Actif" : "Inactif"}
        </button>
      </td>
      <td className="px-4 py-3">
        <span className={`text-sm font-light ${country._count.cities > 0 ? "text-[var(--gold)]" : "text-[var(--text-muted)]"}`} style={{ fontFamily: "var(--font-display)" }}>
          {country._count.cities}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button size="icon-sm" variant="surface" onClick={() => setEditing(true)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          {country._count.cities === 0 && (
            <Button size="icon-sm" variant="ghost" onClick={handleDelete} disabled={isPending}>
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-[var(--error)]" />}
            </Button>
          )}
        </div>
      </td>
    </>
  )

  if (inSortable) {
    return editing ? editingCells : displayCells
  }

  return (
    <tr className="border-b border-[var(--border)] hover:bg-[var(--surface-3)] transition-colors">
      {editing ? editingCells : displayCells}
    </tr>
  )
}
