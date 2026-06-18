import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import type { AuditAction } from "@prisma/client"

// LEGAL NOTE (DE): DSGVO Art. 30 — records of processing activities must be maintained
// All significant data operations should be logged here

interface AuditParams {
  userId?: string
  action: AuditAction
  entity?: string
  entityId?: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function audit(params: AuditParams) {
  try {
    await prisma.auditLog.create({ data: params as Prisma.AuditLogUncheckedCreateInput })
  } catch {
    // Audit log failures should not break the main flow
    // but should be monitored — send to error tracking in production
    console.error("[AUDIT] Failed to write audit log:", params.action)
  }
}
