import type { UserRole, ProfileStatus, KYCStatus, ProfessionalType } from "@prisma/client"

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

// ─── Profiles (public-safe subset) ──────────────────────────────────────────

export interface PublicProfile {
  id: string
  slug: string
  displayName: string
  age: number
  city: {
    nameDE: string
    nameEN: string
    slug: string
    state: string
  }
  tagline: string | null
  bio: string | null
  type: ProfessionalType
  agencyName: string | null
  servicesTags: string[]
  languages: string[]
  outcall: boolean
  incall: boolean
  travel: boolean
  heightCm: number | null
  weightKg: number | null
  bustCm: number | null
  waistCm: number | null
  hipCm: number | null
  cupSize: string | null
  photos: PublicPhoto[]
  kycStatus: KYCStatus
  status: ProfileStatus
  viewCount: number
  favoriteCount: number
  publishedAt: string | null
  _count?: { reviews: number }
}

export interface PublicPhoto {
  id: string
  cdnUrl: string
  isMain: boolean
  position: number
}

// ─── Directory filters ───────────────────────────────────────────────────────

export interface DirectoryFilters {
  city?: string
  language?: string
  type?: ProfessionalType | "all"
  outcall?: boolean
  incall?: boolean
  travel?: boolean
  sort?: "newest" | "popular" | "rating"
  page?: number
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalProfiles: number
  pendingReview: number
  approved: number
  suspended: number
  pendingKyc: number
  openReports: number
  criticalReports: number
  newUsersToday: number
  newUsersWeek: number
}

// ─── API responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
