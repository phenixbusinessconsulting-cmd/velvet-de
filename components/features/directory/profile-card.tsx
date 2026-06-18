import Link from "next/link"
import Image from "next/image"
import { MapPin, Globe, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getLocale, getMessages } from "@/lib/locale"
import type { PublicProfile } from "@/types"

interface ProfileCardProps {
  profile: PublicProfile
  className?: string
}

export async function ProfileCard({ profile, className }: ProfileCardProps) {
  const locale = await getLocale()
  const t = await getMessages(locale)
  const p = t.profile

  const mainPhoto = profile.photos.find((ph) => ph.isMain) ?? profile.photos[0]
  const isVerified = profile.kycStatus === "APPROVED"

  return (
    <Link
      href={`/profil/${profile.slug}`}
      className={cn("group block", className)}
    >
      <div className={cn(
        "card-luxury overflow-hidden",
        "transform-gpu will-change-transform"
      )}>
        {/* Photo */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface-3)]">
          {mainPhoto ? (
            <Image
              src={mainPhoto.cdnUrl}
              alt={profile.displayName}
              fill
              className="object-cover transition-transform duration-[600ms] ease-[var(--ease-luxury)] group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-[var(--border-gold)] flex items-center justify-center">
                <span
                  className="text-2xl text-[var(--gold)] font-light"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {profile.displayName[0]}
                </span>
              </div>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 gradient-hero-overlay opacity-90" />

          {/* Verified badge */}
          {isVerified && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 px-2 py-1 rounded-[var(--r-lg)] glass-gold text-[10px] text-[var(--gold)] font-medium tracking-wide">
                <CheckCircle2 className="w-3 h-3" />
                {p.verifiedShort}
              </div>
            </div>
          )}

          {/* Photo count */}
          {profile.photos.length > 1 && (
            <div className="absolute top-3 left-3">
              <div className="px-2 py-1 rounded-[var(--r-md)] glass text-[10px] text-[var(--text-secondary)]">
                {profile.photos.length} {p.photosCount}
              </div>
            </div>
          )}

          {/* Identity overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3
              className="text-xl font-light text-white leading-tight mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {profile.displayName}
              <span className="text-white/60 font-extralight ml-2 text-lg">{profile.age}</span>
            </h3>
            <div className="flex items-center gap-1 text-white/60 text-xs">
              <MapPin className="w-3 h-3" />
              <span>{profile.city.nameDE}</span>
            </div>
          </div>
        </div>

        {/* Info bar */}
        <div className="p-4 space-y-3">
          {/* Tagline */}
          {profile.tagline && (
            <p className="text-sm text-[var(--text-secondary)] line-clamp-1 italic">
              "{profile.tagline}"
            </p>
          )}

          {/* Languages */}
          {profile.languages.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Globe className="w-3 h-3" />
              <span>{profile.languages.slice(0, 3).join(", ").toUpperCase()}</span>
            </div>
          )}

          {/* Physical stats */}
          {(profile.heightCm || profile.bustCm || profile.cupSize) && (
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              {profile.heightCm && <span>{profile.heightCm} cm</span>}
              {profile.bustCm && profile.waistCm && profile.hipCm && (
                <span className="text-[var(--gold)]/70">{profile.bustCm}–{profile.waistCm}–{profile.hipCm}</span>
              )}
              {profile.cupSize && <span>{locale === "fr" ? "Bonnet" : "Körbchen"} {profile.cupSize}</span>}
            </div>
          )}

          {/* Service tags */}
          {profile.servicesTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.servicesTags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="surface" size="sm">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end pt-1">
            <span className="text-[10px] text-[var(--text-muted)] tracking-wide uppercase">
              {p.viewProfile}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
