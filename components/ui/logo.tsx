"use client"

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useLocale } from "@/context/locale"

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg"
  href?: string
  className?: string
}

const heights = { xs: 54, sm: 66, md: 78, lg: 96 }

export function Logo({ size = "md", href = "/", className }: LogoProps) {
  const { locale } = useLocale()
  const h = heights[size]
  const src = locale === "fr" ? "/logo-fr.png" : "/logo-de.png"

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center focus-visible:outline-none shrink-0", className)}
      aria-label="6sexe@Annonce.com — Zur Startseite"
    >
      <Image
        src={src}
        alt="6sexe@Annonce.com"
        height={h}
        width={Math.round(h * 2.2)}
        className="object-contain"
        priority
      />
    </Link>
  )
}
