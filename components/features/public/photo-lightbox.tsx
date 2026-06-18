"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react"

export interface MediaItem {
  id: string
  url: string
  type: "photo" | "video"
  thumbnail?: string
}

interface Props {
  items: MediaItem[]
}

export function PhotoLightbox({ items }: Props) {
  const [index, setIndex] = useState<number | null>(null)

  const close = useCallback(() => setIndex(null), [])
  const prev = useCallback(() => setIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length)), [items.length])
  const next = useCallback(() => setIndex((i) => (i === null ? null : (i + 1) % items.length)), [items.length])

  useEffect(() => {
    if (index === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [index, close, prev, next])

  const current = index !== null ? items[index] : null

  return (
    <>
      {/* Thumbnails grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setIndex(i)}
            className="relative aspect-square rounded-[var(--r-xl)] overflow-hidden bg-[var(--surface-3)] cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          >
            {item.type === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <>
                {item.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox portal */}
      {current !== null && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev */}
          {items.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-3 sm:left-6 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Media */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {current.type === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.url}
                alt=""
                className="max-w-[90vw] max-h-[90vh] rounded-[var(--r-xl)] object-contain shadow-2xl"
              />
            ) : (
              <video
                key={current.url}
                src={current.url}
                controls
                autoPlay
                className="max-w-[90vw] max-h-[90vh] rounded-[var(--r-xl)] shadow-2xl"
                style={{ maxHeight: "85vh" }}
              />
            )}
            {items.length > 1 && (
              <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-white/40">
                {index! + 1} / {items.length}
              </p>
            )}
          </div>

          {/* Next */}
          {items.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-3 sm:right-6 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
