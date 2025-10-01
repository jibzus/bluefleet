import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { verifyComplianceRecord } from "@/lib/compliance/compliance-engine";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(["ADMIN"]);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { notes } = body;

    if (!notes || !notes.trim()) {
      return NextResponse.json(
        { error: "Rejection notes are required" },
        { status: 400 }
      );
    }

    const compliance = await verifyComplianceRecord({
      complianceId: params.id,
      verifiedBy: user.id,
      status: "REJECTED",
      notes,
    });

    return NextResponse.json({
      success: true,
      compliance,
    });
  } catch (error) {
    console.error("Error rejecting compliance:", error);
    return NextResponse.json(
      { error: "Failed to reject compliance record" },
      { status: 500 }
    );
  }
}

