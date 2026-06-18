"use client"

import { useState, useTransition } from "react"
import { Plus, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createCity } from "./actions"

export function AddCityForm() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    nameDE: "", nameEN: "", slug: "", state: "", stateCode: "",
    sortOrder: 99, isActive: true, showOnLanding: false,
    taglineDE: "", taglineFR: "",
  })
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (!form.nameDE || !form.slug || !form.state || !form.stateCode) {
      setError("Nom DE, slug, état et code état sont obligatoires")
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await createCity({
          ...form,
          nameEN: form.nameEN || form.nameDE,
          taglineDE: form.taglineDE || null,
          taglineFR: form.taglineFR || null,
        })
        setOpen(false)
        setForm({ nameDE: "", nameEN: "", slug: "", state: "", stateCode: "", sortOrder: 99, isActive: true, showOnLanding: false, taglineDE: "", taglineFR: "" })
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur")
      }
    })
  }

  if (!open) {
    return (
      <Button variant="gold-outline" size="sm" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Ajouter une ville
      </Button>
    )
  }

  return (
    <div className="card-luxury p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
          Nouvelle ville
        </h3>
        <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--error)] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && <p className="text-xs text-[var(--error)] mb-4">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Nom DE *</label>
          <Input value={form.nameDE} onChange={(e) => setForm({ ...form, nameDE: e.target.value })} placeholder="München" className="h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Nom EN</label>
          <Input value={form.nameEN} onChange={(e) => setForm({ ...form, nameEN: e.target.value })} placeholder="Munich" className="h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Slug *</label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="muenchen" className="h-9 text-sm font-mono" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Ordre</label>
          <Input value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} type="number" className="h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">État *</label>
          <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Bayern" className="h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Code *</label>
          <Input value={form.stateCode} onChange={(e) => setForm({ ...form, stateCode: e.target.value.toUpperCase() })} placeholder="BY" maxLength={2} className="h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Tagline DE</label>
          <Input value={form.taglineDE} onChange={(e) => setForm({ ...form, taglineDE: e.target.value })} placeholder="Exzellenz aus Bayern" className="h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Tagline FR</label>
          <Input value={form.taglineFR} onChange={(e) => setForm({ ...form, taglineFR: e.target.value })} placeholder="Excellence de Bavière" className="h-9 text-sm" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[var(--gold)]" />
          <span className="text-[var(--text-secondary)]">Active</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.showOnLanding} onChange={(e) => setForm({ ...form, showOnLanding: e.target.checked })} className="accent-[var(--gold)]" />
          <span className="text-[var(--text-secondary)]">Afficher sur la page d'accueil</span>
        </label>
      </div>

      <div className="mt-5 flex gap-3">
        <Button variant="gold" size="sm" onClick={handleSubmit} disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Créer la ville
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
      </div>
    </div>
  )
}
