import crypto from "crypto";
import { prisma } from "@/lib/db";

/**
 * Generate SHA-256 hash of a file buffer
 */
export function generateDocumentHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Generate SHA-256 hash from a string (for testing or text documents)
 */
export function generateStringHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Store document hash in the immutable log
 */
export async function storeDocumentHash({
  documentUrl,
  hash,
  uploadedBy,
  vesselId,
  certificationId,
  metadata,
}: {
  documentUrl: string;
  hash: string;
  uploadedBy: string;
  vesselId?: string;
  certificationId?: string;
  metadata?: any;
}) {
  return await prisma.documentHash.create({
    data: {
      documentUrl,
      hash,
      algorithm: "SHA-256",
      uploadedBy,
      vesselId,
      certificationId,
      metadata,
    },
  });
}

/**
 * Verify document integrity by comparing hashes
 */
export async function verifyDocumentIntegrity(
  documentUrl: string,
  currentHash: string
): Promise<{
  isValid: boolean;
  originalHash?: string;
  uploadedAt?: Date;
}> {
  const storedHash = await prisma.documentHash.findFirst({
    where: { documentUrl },
    orderBy: { createdAt: "asc" }, // Get the original hash
  });

  if (!storedHash) {
    return { isValid: false };
  }

  return {
    isValid: storedHash.hash === currentHash,
    originalHash: storedHash.hash,
    uploadedAt: storedHash.createdAt,
  };
}

/**
 * Get document hash history (for audit trail)
 */
export async function getDocumentHashHistory(documentUrl: string) {
  return await prisma.documentHash.findMany({
    where: { documentUrl },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Check if a document has been tampered with
 * Returns true if multiple different hashes exist for the same document
 */
export async function detectDocumentTampering(
  documentUrl: string
): Promise<boolean> {
  const hashes = await prisma.documentHash.findMany({
    where: { documentUrl },
    select: { hash: true },
  });

  if (hashes.length <= 1) return false;

  const uniqueHashes = new Set(hashes.map((h) => h.hash));
  return uniqueHashes.size > 1; // Tampering detected if multiple different hashes
}

