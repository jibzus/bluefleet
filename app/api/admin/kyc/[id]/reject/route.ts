import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["ADMIN"]);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notes } = await req.json();

    if (!notes || !notes.trim()) {
      return NextResponse.json(
        { error: "Rejection notes are required" },
        { status: 400 }
      );
    }

    // Get the KYC record
    const kycRecord = await prisma.kycRecord.findUnique({
      where: { id: params.id },
    });

    if (!kycRecord) {
      return NextResponse.json({ error: "KYC record not found" }, { status: 404 });
    }

    if (kycRecord.status !== "SUBMITTED") {
      return NextResponse.json(
        { error: "KYC record is not in SUBMITTED status" },
        { status: 400 }
      );
    }

    // Update KYC record to REJECTED
    const updatedKyc = await prisma.kycRecord.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        reviewerId: admin.id,
        // TODO: Add notes field to schema to store rejection reason
      },
    });

    // TODO: Send email notification to user with rejection reason
    // TODO: Log this action for audit trail

    return NextResponse.json({
      success: true,
      kycId: updatedKyc.id,
      status: updatedKyc.status,
    });
  } catch (error) {
    console.error("KYC rejection error:", error);
    return NextResponse.json(
      { error: "Failed to reject KYC application" },
      { status: 500 }
    );
  }
}

