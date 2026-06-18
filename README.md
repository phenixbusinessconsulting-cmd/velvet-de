# VELVET — Premium Companion Directory (Germany)

> **⚠️ IMPORTANT**: Before going live, complete the full [COMPLIANCE.md](./COMPLIANCE.md) checklist  
> and obtain legal sign-off from a qualified German lawyer.

---

## Overview

VELVET is a premium, DSGVO-compliant companion directory platform built for the German market.  
It operates within the legal framework established by ProstSchG (2017) and German digital law.

**Tech Stack:**
- Next.js 15 (App Router, RSC)
- TypeScript
- Tailwind CSS v4
- PostgreSQL + Prisma ORM
- JWT authentication (jose)
- bcrypt password hashing

---

## Project Structure

```
velvet-de/
├── app/
│   ├── page.tsx                    # Landing page (age gate)
│   ├── (public)/                   # Public pages
│   │   ├── verzeichnis/            # Directory listing
│   │   ├── profil/[id]/            # Profile page
│   │   ├── suche/                  # Advanced search
│   │   ├── vertrauen/              # Trust & Safety
│   │   ├── faq/                    # FAQ
│   │   ├── kontakt/                # Contact / Report
│   │   ├── impressum/              # Legal — TMG §5
│   │   ├── datenschutz/            # Privacy — DSGVO
│   │   └── agb/                    # Terms of Service
│   ├── (auth)/
│   │   ├── anmelden/               # Login
│   │   └── registrieren/           # Register
│   ├── (professional)/             # Pro dashboard (auth required)
│   │   ├── dashboard/              # Overview + profile status
│   │   ├── profil/                 # Edit profile
│   │   └── fotos/                  # Photo management
│   ├── (admin)/                    # Admin panel (admin role required)
│   │   └── admin/                  # Admin dashboard
│   └── api/
│       ├── auth/login/             # POST login
│       ├── auth/logout/            # POST logout
│       └── age-verify/             # POST age gate
├── components/
│   ├── ui/                         # Design system components
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   └── logo.tsx
│   └── layout/
│       ├── header.tsx
│       ├── footer.tsx
│       ├── age-gate.tsx            # Full-screen age verification
│       └── cookie-banner.tsx       # DSGVO cookie consent
├── lib/
│   ├── prisma.ts                   # DB client
│   ├── auth.ts                     # JWT + password utils
│   ├── utils.ts                    # Helpers, city data
│   └── audit.ts                    # Audit logging helper
├── middleware.ts                   # Age gate + auth routing
├── prisma/
│   ├── schema.prisma               # Full DB schema
│   └── seed.ts                     # Initial data
├── COMPLIANCE.md                   # ← Read this before launch
└── .env.example                    # Environment variables template
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- npm or pnpm

### 1. Clone and install

```bash
cd /Users/patricetalens/velvet-de
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your actual values
```

Critical variables:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="<64-char random string>"
NEXT_PUBLIC_APP_URL="https://your-domain.de"
```

### 3. Database setup

```bash
npm run db:migrate     # Run migrations
npm run db:seed        # Seed cities, blocked words, admin user
npm run db:studio      # Visual editor (optional)
```

### 4. Development

```bash
npm run dev
```

### 5. Production build

```bash
npm run build
npm run start
```

---

## Key Architecture Decisions

### Age Gate
- Cookie-based gate (`age_verified=1`) set via `/api/age-verify`
- Middleware enforces redirect to `/?age_gate=1` for unverified visitors
- Legal pages (impressum, datenschutz, agb) bypass age gate — required by law
- **⚠️ TODO**: Integrate certified German age verification provider for production

### Authentication
- Custom JWT (`jose`) — no NextAuth dependency for simplicity
- Tokens stored in httpOnly cookies (XSS protection)
- Sessions stored in DB for revocation capability
- Rate limiting on login endpoint (5 attempts / 15 min per IP)

### Profile Lifecycle
```
DRAFT → PENDING_REVIEW → APPROVED
                       → REJECTED
APPROVED → SUSPENDED
         → ARCHIVED
```

### KYC Document Flow
```
PENDING → DOCUMENTS_REQUESTED → UNDER_REVIEW → APPROVED
                                             → REJECTED
```
Documents stored encrypted (path-based), never served publicly.

### Security
- All IP addresses hashed (SHA-256) before storage — never stored in plaintext
- Audit log for all sensitive operations (DSGVO Art. 30)
- Blocked words checked on all user-generated content
- Photo moderation required before CDN publication

---

## User Roles

| Role | Access |
|------|--------|
| VISITOR | Browse approved profiles |
| PROFESSIONAL | Own dashboard + profile management |
| MODERATOR | Admin panel read + moderation |
| ADMIN | Full admin panel |
| SUPER_ADMIN | Full admin + system settings |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | 64-char random secret for JWT signing |
| `NEXT_PUBLIC_APP_URL` | ✅ | Production URL |
| `ENCRYPTION_KEY` | ✅ | AES-256 key for KYC document encryption |
| `STORAGE_*` | ✅ | File storage configuration |
| `EMAIL_FROM` / `RESEND_API_KEY` | ✅ prod | Transactional email |
| `ADMIN_INITIAL_EMAIL` | seed only | Initial admin account |

---

## Compliance Summary

| Requirement | Status | Notes |
|-------------|--------|-------|
| Impressum (TMG §5) | ⚠️ Draft | Replace TODO placeholders |
| Datenschutz (DSGVO) | ⚠️ Draft | Legal review required |
| AGB (BGB §305ff) | ⚠️ Draft | Legal review required |
| Age verification | ⚠️ Basic | Cookie gate — upgrade for production |
| ProstSchG KYC | ✅ Schema | Admin workflow implemented |
| Cookie consent | ✅ | Granular DSGVO-compliant banner |
| Audit logging | ✅ | All critical actions logged |
| Data encryption | ✅ | KYC docs + IP hashing |
| Rate limiting | ✅ | Login, registration endpoints |
| Blocked words | ✅ | Seed + DB-managed list |

See [COMPLIANCE.md](./COMPLIANCE.md) for the full checklist.

---

## TODO Before Production

1. **Legal Review** — hire qualified German lawyer for DSGVO + ProstSchG compliance
2. **Real company data** — fill Impressum TODO placeholders
3. **Age verification upgrade** — integrate certified provider (Verimi / IDnow)
4. **CAPTCHA** — add to registration and login forms
5. **Email system** — transactional email (verification, notifications)
6. **File upload** — implement `/api/upload` with virus scanning
7. **Search page** — implement `/app/(public)/suche/page.tsx` with filters
8. **DPIA** — Data Protection Impact Assessment (Art. 35 DSGVO)
9. **Pen test** — security penetration test
10. **Monitoring** — error tracking, uptime monitoring

---

## License

Proprietary — All rights reserved · VELVET Group GmbH
