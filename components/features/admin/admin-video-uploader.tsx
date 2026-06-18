"use client"

import { useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Video, X, Upload, Check } from "lucide-react"

interface Props {
  profileId: string
}

export function AdminVideoUploader({ profileId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError("")
  }

  function handleClose() {
    setOpen(false)
    setFile(null)
    setError("")
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("profileId", profileId)
      fd.append("file", file)

      const xhr = new XMLHttpRequest()
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else {
            const data = JSON.parse(xhr.responseText)
            reject(new Error(data.error ?? "Erreur upload"))
          }
        }
        xhr.onerror = () => reject(new Error("Erreur réseau"))
        xhr.open("POST", "/api/admin/videos/upload")
        xhr.send(fd)
      })

      handleClose()
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setUploading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  return (
    <>
      {/* Add card */}
      <div
        onClick={() => setOpen(true)}
        className="relative aspect-[3/4] rounded-[var(--r-lg)] border border-dashed border-[var(--border-gold)]/40 cursor-pointer hover:border-[var(--border-gold)] hover:bg-[var(--gold-muted)] transition-all flex flex-col items-center justify-center gap-2"
      >
        <Video className="w-6 h-6 text-[var(--gold)]/50" />
        <span className="text-[10px] text-[var(--text-muted)] text-center px-2">Ajouter une vidéo</span>
      </div>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-md rounded-[var(--r-2xl)] overflow-hidden"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-base font-light text-[var(--pearl)]" style={{ fontFamily: "var(--font-display)" }}>
                    Ajouter une vidéo
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">MP4, MOV, WebM — max 200 Mo</p>
                </div>
                <button onClick={handleClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {!file ? (
                  <div
                    onClick={() => inputRef.current?.click()}
                    className="border border-dashed border-[var(--border-gold)]/40 rounded-[var(--r-xl)] p-10 text-center cursor-pointer hover:border-[var(--border-gold)] hover:bg-[var(--gold-muted)] transition-all"
                  >
                    <Video className="w-10 h-10 text-[var(--gold)]/50 mx-auto mb-3" />
                    <p className="text-sm text-[var(--text-secondary)]">Cliquer pour sélectionner</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">MP4, MOV, WebM — max 200 Mo</p>
                  </div>
                ) : (
                  <div className="rounded-[var(--r-xl)] bg-[var(--surface-3)] border border-[var(--border)] p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Video className="w-5 h-5 text-[var(--gold)] flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm text-[var(--text-primary)] truncate">{file.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{formatSize(file.size)}</p>
                      </div>
                      <button onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = "" }}
                        className="text-[var(--text-muted)] hover:text-[var(--error)] transition-colors flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {uploading && (
                      <div className="space-y-1">
                        <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--gold)] transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-[var(--text-muted)] text-right">{progress}%</p>
                      </div>
                    )}
                  </div>
                )}

                <input ref={inputRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleFileChange} />

                {error && <p className="text-xs text-[var(--error)]">{error}</p>}

                <div className="flex justify-end gap-3 pt-1">
                  <button onClick={handleClose} disabled={uploading}
                    className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50">
                    Annuler
                  </button>
                  <button onClick={handleUpload} disabled={!file || uploading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--r-lg)] bg-[var(--gold)] text-[var(--noir)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                    {uploading
                      ? <><span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" /> Envoi {progress}%</>
                      : <><Upload className="w-3.5 h-3.5" /> Uploader</>
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
