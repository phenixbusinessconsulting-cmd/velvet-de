"use client"

import { useState, useCallback, useRef } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { Upload, Check, X, ZoomIn, ZoomOut, RotateCw, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface PhotoUploaderProps {
  onUploaded?: () => void
  defaultPrivate?: boolean
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
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
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)

  return new Promise((res, rej) => canvas.toBlob((b) => b ? res(b) : rej(new Error("Canvas empty")), "image/jpeg", 0.92))
}

export function PhotoUploader({ onUploaded, defaultPrivate = false }: PhotoUploaderProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [isMain, setIsMain] = useState(false)
  const [isPrivate, setIsPrivate] = useState(defaultPrivate)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
    setError(null)
    setZoom(1)
    setRotation(0)
    setCrop({ x: 0, y: 0 })
  }

  const onCropComplete = useCallback((_: Area, cropped: Area) => {
    setCroppedArea(cropped)
  }, [])

  const handleUpload = async () => {
    if (!imageSrc || !croppedArea) return
    setUploading(true)
    setError(null)
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea)
      const fd = new FormData()
      fd.append("file", blob, "photo.jpg")
      fd.append("isMain", String(isMain))
      fd.append("isPrivate", String(isPrivate))

      const res = await fetch("/api/photos/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur upload")

      setImageSrc(null)
      if (inputRef.current) inputRef.current.value = ""
      onUploaded?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setImageSrc(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-4">
      {/* Drop zone / file picker */}
      {!imageSrc && (
        <div
          onClick={() => inputRef.current?.click()}
          className="border border-dashed border-[var(--border-gold)]/40 rounded-[var(--r-xl)] p-8 text-center cursor-pointer hover:border-[var(--border-gold)] hover:bg-[var(--gold-muted)] transition-all"
        >
          <Upload className="w-8 h-8 text-[var(--gold)]/50 mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Cliquer pour sélectionner une photo</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">JPG, PNG, WebP — max 10 Mo</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      )}

      {/* Crop modal */}
      {imageSrc && (
        <div className="card-luxury overflow-hidden">
          {/* Crop area */}
          <div className="relative bg-black" style={{ height: 420 }}>
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

          {/* Controls */}
          <div className="p-5 space-y-4 bg-[var(--surface-2)]">
            {/* Zoom */}
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-[var(--gold)] h-1"
              />
              <ZoomIn className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-3">
              <RotateCw className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-1 accent-[var(--gold)] h-1"
              />
              <span className="text-xs text-[var(--text-muted)] w-10 text-right">{rotation}°</span>
            </div>

            {/* Options + actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMain}
                    onChange={(e) => setIsMain(e.target.checked)}
                    className="w-4 h-4 accent-[var(--gold)]"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">Photo principale</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 accent-[var(--gold)]"
                  />
                  <Lock className="w-3.5 h-3.5 text-[var(--gold)]" />
                  <span className="text-sm text-[var(--text-secondary)]">Galerie privée</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel} disabled={uploading}>
                  <X className="w-4 h-4 mr-1" /> Annuler
                </Button>
                <Button variant="gold" size="sm" onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                      Upload…
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Confirmer
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {error && <p className="text-xs text-[var(--error)]">{error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
