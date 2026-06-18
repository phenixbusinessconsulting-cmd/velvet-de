"use client"

import { useState, useCallback } from "react"
import { createPortal } from "react-dom"
import Cropper from "react-easy-crop"
import { Scissors } from "lucide-react"

interface Area { x: number; y: number; width: number; height: number }

interface Props {
  photoId: string
  cdnUrl: string
}

export function PhotoCropButton({ photoId, cdnUrl }: Props) {
  const [open, setOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  function handleOpen() {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setError("")
    setOpen(true)
  }

  async function handleSave() {
    if (!croppedAreaPixels) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/photos/crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, crop: croppedAreaPixels }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Erreur serveur")
        return
      }
      setOpen(false)
      window.location.reload()
    } catch {
      setError("Erreur réseau")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] text-[11px] font-medium hover:border-[var(--border-gold)] hover:text-[var(--gold)] transition-colors w-full justify-center"
      >
        <Scissors className="w-3 h-3" /> Recadrer
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="w-full max-w-md space-y-5 rounded-[var(--r-2xl)] p-6"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-base font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
                Recadrer la photo
              </h3>

              <div className="relative h-72 rounded-[var(--r-xl)] overflow-hidden bg-black">
                <Cropper
                  image={cdnUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 4}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Zoom</span>
                  <span>{zoom.toFixed(1)}×</span>
                </div>
                <input
                  type="range" min={1} max={3} step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[var(--gold)]"
                />
              </div>

              {error && <p className="text-xs text-[var(--error)]">{error}</p>}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !croppedAreaPixels}
                  className="px-4 py-2 rounded-[var(--r-lg)] bg-[var(--gold)] text-[var(--noir)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
