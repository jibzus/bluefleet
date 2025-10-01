import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/contracts/[id] - Get contract details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            vessel: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            operator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Check authorization
    const isOwner = contract.booking.vessel.ownerId === user.id;
    const isOperator = contract.booking.operatorId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isOperator && !isAdmin) {
      return NextResponse.json(
        { error: "Not authorized to view this contract" },
        { status: 403 }
      );
    }

    return NextResponse.json(contract);
  } catch (error: any) {
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch contract" },
      { status: 500 }
    );
  }
}

