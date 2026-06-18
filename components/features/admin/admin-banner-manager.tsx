"use client"

import { useState, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { ImagePlus, X, ZoomIn, ZoomOut, RotateCw, Check, Pencil } from "lucide-react"

interface Props {
  profileId: string
  currentBannerUrl?: string | null
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
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)
  }
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Canvas empty"))), "image/jpeg", 0.92)
  )
}

export function AdminBannerManager({ profileId, currentBannerUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
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
      setZoom(1); setRotation(0); setCrop({ x: 0, y: 0 }); setError("")
    }
    reader.readAsDataURL(file)
  }

  function handleClose() {
    setOpen(false); setImageSrc(null); setError("")
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleUpload() {
    if (!imageSrc || !croppedArea) return
    setUploading(true); setError("")
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea, rotation)
      const fd = new FormData()
      fd.append("profileId", profileId)
      fd.append("file", blob, "banner.jpg")
      const res = await fetch("/api/admin/banner", { method: "POST", body: fd })
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
      {/* Preview + trigger */}
      <div className="space-y-2">
        {currentBannerUrl ? (
          <div className="relative group rounded-[var(--r-lg)] overflow-hidden" style={{ aspectRatio: "16/9" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentBannerUrl} alt="Bannière" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-[var(--r-lg)] bg-[var(--gold)] text-[var(--noir)] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Pencil className="w-3.5 h-3.5" /> Modifier la bannière
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-[var(--r-lg)] border border-dashed border-[var(--border-gold)]/40 cursor-pointer hover:border-[var(--border-gold)] hover:bg-[var(--gold-muted)] transition-all p-8"
            style={{ aspectRatio: "16/9" }}
          >
            <ImagePlus className="w-8 h-8 text-[var(--gold)]/50" />
            <span className="text-sm text-[var(--text-muted)]">Ajouter une bannière (format 16:9)</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-[var(--r-2xl)] overflow-hidden"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-base font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
                    Bannière de profil
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Format 16:9 — affiché en haut de la page profil</p>
                </div>
                <button onClick={handleClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* File picker */}
              {!imageSrc && (
                <div className="p-6">
                  <div
                    onClick={() => inputRef.current?.click()}
                    className="border border-dashed border-[var(--border-gold)]/40 rounded-[var(--r-xl)] p-12 text-center cursor-pointer hover:border-[var(--border-gold)] hover:bg-[var(--gold-muted)] transition-all"
                  >
                    <ImagePlus className="w-10 h-10 text-[var(--gold)]/50 mx-auto mb-3" />
                    <p className="text-sm text-[var(--text-secondary)]">Cliquer pour sélectionner une image</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">JPG, PNG, WebP — max 15 Mo</p>
                  </div>
                  <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
                </div>
              )}

              {/* Crop UI */}
              {imageSrc && (
                <>
                  {/* 16:9 crop area */}
                  <div className="relative bg-black" style={{ height: 360 }}>
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      rotation={rotation}
                      aspect={16 / 9}
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
                    <div className="flex items-center gap-3">
                      <ZoomOut className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                      <input type="range" min={1} max={3} step={0.05} value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="flex-1 accent-[var(--gold)] h-1" />
                      <ZoomIn className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-3">
                      <RotateCw className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                      <input type="range" min={-180} max={180} step={1} value={rotation}
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="flex-1 accent-[var(--gold)] h-1" />
                      <span className="text-xs text-[var(--text-muted)] w-10 text-right">{rotation}°</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button onClick={() => { setImageSrc(null); if (inputRef.current) inputRef.current.value = "" }}
                        disabled={uploading}
                        className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50">
                        Changer l&apos;image
                      </button>
                      <button onClick={handleUpload} disabled={uploading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--r-lg)] bg-[var(--gold)] text-[var(--noir)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                        {uploading
                          ? <><span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" /> Enregistrement…</>
                          : <><Check className="w-4 h-4" /> Enregistrer</>
                        }
                      </button>
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
