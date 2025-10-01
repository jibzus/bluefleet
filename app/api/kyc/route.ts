import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { kycFormSchema } from "@/lib/validators/kyc";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate the form data
    const result = kycFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Check if user already has a pending or approved KYC
    const existingKyc = await prisma.kycRecord.findFirst({
      where: {
        userId: user.id,
        status: { in: ["SUBMITTED", "APPROVED"] },
      },
    });

    if (existingKyc) {
      return NextResponse.json(
        { error: "You already have a pending or approved KYC application" },
        { status: 400 }
      );
    }

    // Create KYC record
    const kycRecord = await prisma.kycRecord.create({
      data: {
        userId: user.id,
        status: "SUBMITTED",
        fields: body,
      },
    });

    // TODO: Send email notification to user
    // TODO: Send notification to admin for review

    return NextResponse.json({
      success: true,
      kycId: kycRecord.id,
      status: kycRecord.status,
    });
  } catch (error) {
    console.error("KYC submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit KYC application" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's KYC records
    const kycRecords = await prisma.kycRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ kycRecords });
  } catch (error) {
    console.error("KYC fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC records" },
      { status: 500 }
    );
  }
}
