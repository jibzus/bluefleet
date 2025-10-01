import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { escrowReleaseSchema } from "@/lib/validators/escrow";

// POST /api/escrow/[id]/release - Release escrow to owner
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();

    // Validate request
    const validation = escrowReleaseSchema.safeParse({
      ...body,
      transactionId: id,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { releaseReason } = validation.data;

    // Get escrow transaction
    const escrow = await prisma.escrowTransaction.findUnique({
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

    if (!escrow) {
      return NextResponse.json(
        { error: "Escrow transaction not found" },
        { status: 404 }
      );
    }

    // Check authorization - only operator, owner, or admin can release
    const isOperator = escrow.booking.operatorId === user.id;
    const isOwner = escrow.booking.vessel.ownerId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOperator && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Not authorized to release this escrow" },
        { status: 403 }
      );
    }

    // Escrow must be funded
    if (escrow.status !== "FUNDED") {
      return NextResponse.json(
        { error: "Escrow must be funded before release" },
        { status: 400 }
      );
    }

    // Check if booking period has ended
    const now = new Date();
    const endDate = new Date(escrow.booking.end);

    if (now < endDate) {
      // Allow early release only by admin or with both parties' consent
      if (!isAdmin) {
        return NextResponse.json(
          {
            error:
              "Booking period has not ended. Only admins can release early.",
          },
          { status: 400 }
        );
      }
    }

    // Update escrow status
    const logs = escrow.logs as any;
    const updatedEscrow = await prisma.escrowTransaction.update({
      where: { id },
      data: {
        status: "RELEASED",
        logs: {
          ...logs,
          released: {
            timestamp: new Date().toISOString(),
            userId: user.id,
            reason: releaseReason,
          },
        },
      },
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

    // TODO: Trigger payout to owner via payment provider
    // const payoutResponse = await initiatePayoutToOwner(updatedEscrow);

    return NextResponse.json({
      escrow: updatedEscrow,
      message: "Escrow released successfully. Payout initiated to owner.",
    });
  } catch (error: any) {
    console.error("Error releasing escrow:", error);
    return NextResponse.json(
      { error: error.message || "Failed to release escrow" },
      { status: 500 }
    );
  }
}

