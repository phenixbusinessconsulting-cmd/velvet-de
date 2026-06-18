"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { Lock, X, Mail, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Props {
  profileId: string
  profileName: string
  price: number | null
  privatePhotoCount: number
  privateVideoCount: number
  placeholderUrl: string | null
}

export function PrivateGalleryLock({
  profileId,
  profileName,
  price,
  privatePhotoCount,
  privateVideoCount,
  placeholderUrl,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const totalItems = privatePhotoCount + privateVideoCount
  const previewCount = Math.min(totalItems, 4)

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez entrer une adresse email valide.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/private-gallery/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      router.push(`/galerie-privee/${data.token}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
      setLoading(false)
    }
  }

  const label = [
    privatePhotoCount > 0 ? `${privatePhotoCount} photo${privatePhotoCount > 1 ? "s" : ""}` : "",
    privateVideoCount > 0 ? `${privateVideoCount} vidéo${privateVideoCount > 1 ? "s" : ""}` : "",
  ].filter(Boolean).join(" · ")

  return (
    <>
      {/* Section title */}
      <div className="flex items-center gap-2 mt-2 mb-3">
        <Lock className="w-4 h-4 text-[var(--gold)]" />
        <span className="text-sm text-[var(--text-muted)]">Contenu privé — {label}</span>
      </div>

      {/* Blurred placeholders grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {Array.from({ length: previewCount }).map((_, i) => {
          const isVideo = i >= privatePhotoCount
          return (
            <button
              key={i}
              onClick={() => setOpen(true)}
              className="relative aspect-square rounded-[var(--r-xl)] overflow-hidden bg-[var(--surface-3)] cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            >
              {placeholderUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={placeholderUrl}
                  alt=""
                  className="w-full h-full object-cover scale-110"
                  style={{ filter: "blur(12px)" }}
                />
              ) : (
                <div className="w-full h-full" style={{
                  background: "linear-gradient(135deg, var(--surface-3), var(--navy))",
                }} />
              )}
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
              {/* Icons */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                {isVideo && <Play className="w-5 h-5 text-white/60 fill-white/60" />}
                <Lock className="w-5 h-5 text-[var(--gold)]" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Unlock CTA */}
      {price !== null ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full mt-3 py-2.5 rounded-[var(--r-xl)] text-sm font-medium transition-all"
          style={{
            background: "linear-gradient(135deg, var(--surface-2), var(--navy))",
            border: "1px solid var(--border-gold)",
            color: "var(--gold)",
          }}
        >
          <Lock className="w-3.5 h-3.5 inline mr-2" />
          Débloquer pour {price.toFixed(2)} €
        </button>
      ) : (
        <div className="w-full mt-3 py-2.5 rounded-[var(--r-xl)] text-sm text-center"
          style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <Lock className="w-3.5 h-3.5 inline mr-2 opacity-50" />
          Prix bientôt disponible
        </div>
      )}

      {/* Modal */}
      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm rounded-[var(--r-2xl)] overflow-hidden"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border-gold)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
              <div>
                <h3 className="text-lg font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
                  Galerie privée
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{profileName} · {label}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUnlock} noValidate className="p-6 space-y-5">
              {/* Price */}
              <div className="text-center py-3">
                <p className="text-3xl font-light text-[var(--gold)]" style={{ fontFamily: "var(--font-display)" }}>
                  {price !== null ? `${price.toFixed(2)} €` : "—"}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Accès illimité à la galerie privée</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
                  Votre email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-[var(--r-lg)] pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Un lien d'accès personnel vous sera envoyé
                </p>
              </div>

              {error && <p className="text-xs text-[var(--error)]">{error}</p>}

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading || price === null}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                    Traitement…
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Payer {price?.toFixed(2)} € et accéder
                  </>
                )}
              </Button>

              <p className="text-[10px] text-center text-[var(--text-muted)]">
                Paiement sécurisé · Accès immédiat · Usage personnel uniquement
              </p>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
