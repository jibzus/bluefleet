import { prisma } from "@/lib/db";
import { ComplianceType, ComplianceStatus } from "@prisma/client";

/**
 * Create a compliance record
 */
export async function createComplianceRecord({
  vesselId,
  certificationId,
  type,
  status = "PENDING" as ComplianceStatus,
  expiresAt,
  notes,
  metadata,
}: {
  vesselId: string;
  certificationId?: string;
  type: ComplianceType;
  status?: ComplianceStatus;
  expiresAt?: Date;
  notes?: string;
  metadata?: any;
}) {
  return await prisma.complianceRecord.create({
    data: {
      vesselId,
      certificationId,
      type,
      status,
      expiresAt,
      notes,
      metadata,
    },
  });
}

/**
 * Verify a compliance record
 */
export async function verifyComplianceRecord({
  complianceId,
  verifiedBy,
  status,
  notes,
}: {
  complianceId: string;
  verifiedBy: string;
  status: ComplianceStatus;
  notes?: string;
}) {
  // Update compliance record
  const compliance = await prisma.complianceRecord.update({
    where: { id: complianceId },
    data: {
      status,
      verifiedBy,
      verifiedAt: new Date(),
      notes,
    },
  });

  // Create verification log
  await prisma.verificationLog.create({
    data: {
      complianceId,
      action: `Status changed to ${status}`,
      performedBy: verifiedBy,
      notes,
      metadata: {
        previousStatus: compliance.status,
        newStatus: status,
      },
    },
  });

  return compliance;
}

/**
 * Get compliance records expiring soon (within days)
 */
export async function getExpiringCompliance(withinDays: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + withinDays);

  return await prisma.complianceRecord.findMany({
    where: {
      expiresAt: {
        lte: futureDate,
        gte: new Date(), // Not already expired
      },
      status: {
        in: ["VERIFIED", "PENDING"],
      },
    },
    include: {
      verifier: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      expiresAt: "asc",
    },
  });
}

/**
 * Get expired compliance records
 */
export async function getExpiredCompliance() {
  return await prisma.complianceRecord.findMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
      status: {
        not: "EXPIRED",
      },
    },
    include: {
      verifier: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Mark expired compliance records
 * This should be run by a cron job
 */
export async function markExpiredCompliance() {
  const expired = await getExpiredCompliance();

  const updates = expired.map((record) =>
    prisma.complianceRecord.update({
      where: { id: record.id },
      data: { status: "EXPIRED" },
    })
  );

  await Promise.all(updates);

  return expired.length;
}

/**
 * Get compliance statistics
 */
export async function getComplianceStats() {
  const [total, pending, verified, expired, rejected, underReview, expiringSoon] =
    await Promise.all([
      prisma.complianceRecord.count(),
      prisma.complianceRecord.count({ where: { status: "PENDING" } }),
      prisma.complianceRecord.count({ where: { status: "VERIFIED" } }),
      prisma.complianceRecord.count({ where: { status: "EXPIRED" } }),
      prisma.complianceRecord.count({ where: { status: "REJECTED" } }),
      prisma.complianceRecord.count({ where: { status: "UNDER_REVIEW" } }),
      getExpiringCompliance(30).then((records) => records.length),
    ]);

  return {
    total,
    pending,
    verified,
    expired,
    rejected,
    underReview,
    expiringSoon,
  };
}

/**
 * Get compliance records for a vessel
 */
export async function getVesselCompliance(vesselId: string) {
  return await prisma.complianceRecord.findMany({
    where: { vesselId },
    include: {
      verifier: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      logs: {
        include: {
          performer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Get verification log for a compliance record
 */
export async function getVerificationLog(complianceId: string) {
  return await prisma.verificationLog.findMany({
    where: { complianceId },
    include: {
      performer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Check vessel compliance status
 * Returns overall compliance health
 */
export async function checkVesselComplianceStatus(vesselId: string) {
  const records = await getVesselCompliance(vesselId);

  const hasExpired = records.some((r) => r.status === "EXPIRED");
  const hasPending = records.some((r) => r.status === "PENDING");
  const hasRejected = records.some((r) => r.status === "REJECTED");
  const allVerified = records.every((r) => r.status === "VERIFIED");

  let overallStatus: "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL" | "PENDING";

  if (hasExpired || hasRejected) {
    overallStatus = "NON_COMPLIANT";
  } else if (allVerified && records.length > 0) {
    overallStatus = "COMPLIANT";
  } else if (hasPending) {
    overallStatus = "PENDING";
  } else {
    overallStatus = "PARTIAL";
  }

  return {
    overallStatus,
    totalRecords: records.length,
    verified: records.filter((r) => r.status === "VERIFIED").length,
    pending: records.filter((r) => r.status === "PENDING").length,
    expired: records.filter((r) => r.status === "EXPIRED").length,
    rejected: records.filter((r) => r.status === "REJECTED").length,
    records,
  };
}

