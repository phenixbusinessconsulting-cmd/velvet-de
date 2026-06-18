"use client"

import { useState, useTransition } from "react"
import { Plus, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createCountry } from "./actions"
import { COUNTRY_OPTIONS, slugify } from "./flags"

export function AddCountryForm() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    code: "", nameDE: "", nameEN: "", slug: "", flag: "",
    sortOrder: 99, isActive: true,
  })
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (!form.code || !form.nameDE || !form.slug) {
      setError("Code, nom DE et slug sont obligatoires")
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await createCountry({
          ...form,
          nameEN: form.nameEN || form.nameDE,
          flag: form.flag || null,
        })
        setOpen(false)
        setForm({ code: "", nameDE: "", nameEN: "", slug: "", flag: "", sortOrder: 99, isActive: true })
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur")
      }
    })
  }

  if (!open) {
    return (
      <Button variant="gold-outline" size="sm" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Ajouter un pays
      </Button>
    )
  }

  return (
    <div className="card-luxury p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
          Nouveau pays
        </h3>
        <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--error)] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && <p className="text-xs text-[var(--error)] mb-4">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="space-y-1 col-span-2">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Drapeau / Pays</label>
          <select
            value={COUNTRY_OPTIONS.find((o) => o.flag === form.flag)?.code ?? ""}
            onChange={(e) => {
              const opt = COUNTRY_OPTIONS.find((o) => o.code === e.target.value)
              if (!opt) { setForm({ ...form, flag: "" }); return }
              setForm((f) => ({
                ...f,
                flag: opt.flag,
                code: f.code || opt.code,
                nameDE: f.nameDE || opt.nameDE,
                nameEN: f.nameEN || opt.nameEN,
                slug: f.slug || slugify(opt.nameDE),
              }))
            }}
            className="h-9 w-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--surface-2)] px-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
          >
            <option value="">— Choisir un drapeau —</option>
            {COUNTRY_OPTIONS.map((o) => (
              <option key={o.code} value={o.code}>{o.flag} {o.nameDE}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Nom DE *</label>
          <Input value={form.nameDE} onChange={(e) => setForm({ ...form, nameDE: e.target.value })} placeholder="Deutschland" className="h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Nom EN</label>
          <Input value={form.nameEN} onChange={(e) => setForm({ ...form, nameEN: e.target.value })} placeholder="Germany" className="h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Code *</label>
          <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="DE" maxLength={2} className="h-9 text-sm font-mono uppercase" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Slug *</label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="deutschland" className="h-9 text-sm font-mono" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Ordre</label>
          <Input value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} type="number" className="h-9 text-sm" />
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[var(--gold)]" />
          <span className="text-[var(--text-secondary)]">Actif</span>
        </label>
      </div>

      <div className="mt-5 flex gap-3">
        <Button variant="gold" size="sm" onClick={handleSubmit} disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Créer le pays
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
      </div>
    </div>
  )
}
