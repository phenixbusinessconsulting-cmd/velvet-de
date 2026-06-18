"use client"

import { useState, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { Plus, X, ZoomIn, ZoomOut, RotateCw, Check } from "lucide-react"

interface Props {
  profileId: string
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area, rotation: number): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = imageSrc
  })

  const canvas = document.createElement("canvas")
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext("2d")!

  if (rotation !== 0) {
    const rad = (rotation * Math.PI) / 180
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(rad)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)
  }

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  )

  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Canvas empty"))), "image/jpeg", 0.92)
  )
}

export function AdminPhotoUploader({ profileId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [isMain, setIsMain] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels)
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setZoom(1)
      setRotation(0)
      setCrop({ x: 0, y: 0 })
      setError("")
    }
    reader.readAsDataURL(file)
  }

  function handleClose() {
    setOpen(false)
    setImageSrc(null)
    setError("")
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleUpload() {
    if (!imageSrc || !croppedArea) return
    setUploading(true)
    setError("")
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea, rotation)
      const fd = new FormData()
      fd.append("profileId", profileId)
      fd.append("file", blob, "photo.jpg")
      fd.append("isMain", String(isMain))

      const res = await fetch("/api/admin/photos/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur upload")

      handleClose()
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      {/* Trigger card */}
      <div
        onClick={() => setOpen(true)}
        className="aspect-[3/4] rounded-[var(--r-lg)] border border-dashed border-[var(--border-gold)]/40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--border-gold)] hover:bg-[var(--gold-muted)] transition-all"
      >
        <Plus className="w-6 h-6 text-[var(--gold)]/50" />
        <span className="text-xs text-[var(--text-muted)]">Ajouter</span>
      </div>

      {/* Modal — rendu dans document.body via portal */}
      {open && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80">
          <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-[var(--r-2xl)] overflow-hidden"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h3 className="text-base font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
                Ajouter une photo
              </h3>
              <button onClick={handleClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* File picker */}
            {!imageSrc && (
              <div className="p-6">
                <div
                  onClick={() => inputRef.current?.click()}
                  className="border border-dashed border-[var(--border-gold)]/40 rounded-[var(--r-xl)] p-10 text-center cursor-pointer hover:border-[var(--border-gold)] hover:bg-[var(--gold-muted)] transition-all"
                >
                  <Plus className="w-8 h-8 text-[var(--gold)]/50 mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-secondary)]">Cliquer pour sélectionner</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">JPG, PNG, WebP — max 10 Mo</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {/* Crop UI */}
            {imageSrc && (
              <>
                <div className="relative bg-black" style={{ height: 340 }}>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={3 / 4}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    style={{
                      containerStyle: { borderRadius: 0 },
                      cropAreaStyle: { border: "2px solid var(--gold)" },
                    }}
                  />
                </div>

                <div className="p-5 space-y-3 bg-[var(--surface-2)]">
                  {/* Zoom */}
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                    <input type="range" min={1} max={3} step={0.05} value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-1 accent-[var(--gold)] h-1" />
                    <ZoomIn className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                  </div>
                  {/* Rotation */}
                  <div className="flex items-center gap-3">
                    <RotateCw className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                    <input type="range" min={-180} max={180} step={1} value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="flex-1 accent-[var(--gold)] h-1" />
                    <span className="text-xs text-[var(--text-muted)] w-10 text-right">{rotation}°</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isMain} onChange={(e) => setIsMain(e.target.checked)}
                        className="w-4 h-4 accent-[var(--gold)]" />
                      <span className="text-sm text-[var(--text-secondary)]">Photo principale</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button onClick={() => { setImageSrc(null); if (inputRef.current) inputRef.current.value = "" }}
                        disabled={uploading}
                        className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50">
                        Changer
                      </button>
                      <button onClick={handleUpload} disabled={uploading}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-[var(--r-lg)] bg-[var(--gold)] text-[var(--noir)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                        {uploading
                          ? <><span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" /> Upload…</>
                          : <><Check className="w-4 h-4" /> Confirmer</>
                        }
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-xs text-[var(--error)]">{error}</p>}
                </div>
              </>
            )}
          </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
