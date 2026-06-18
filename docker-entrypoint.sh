#!/bin/sh
set -e

echo "[velvet] Running DB push..."
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

echo "[velvet] Seeding database..."
npx tsx prisma/seed.ts || echo "[velvet] Seed skipped or already done"

echo "[velvet] Starting Next.js..."
exec npm run start
