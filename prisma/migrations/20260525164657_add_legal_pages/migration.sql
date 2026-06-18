-- CreateTable
CREATE TABLE "LegalPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleDE" TEXT NOT NULL DEFAULT '',
    "titleFR" TEXT NOT NULL DEFAULT '',
    "contentDE" TEXT NOT NULL DEFAULT '',
    "contentFR" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalPage_slug_key" ON "LegalPage"("slug");
