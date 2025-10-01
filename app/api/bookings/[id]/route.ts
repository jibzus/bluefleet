import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/bookings/[id] - Get single booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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
            media: {
              orderBy: { sort: "asc" },
              take: 1,
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
        contract: true,
        escrow: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const isOperator = booking.operatorId === user.id;
    const isOwner = booking.vessel.owner.id === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOperator && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id] - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { status, note, terms } = body;

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const isOperator = booking.operatorId === user.id;
    const isOwner = booking.vessel.owner.id === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOperator && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Validate status transitions
    if (status) {
      // Operators can only cancel their own requests
      if (isOperator && !isOwner && status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Operators can only cancel bookings" },
          { status: 403 }
        );
      }

      // Owners can accept, counter, or cancel
      if (isOwner && !["ACCEPTED", "COUNTERED", "CANCELLED"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status transition" },
          { status: 400 }
        );
      }

      // Cannot modify accepted or cancelled bookings
      if (["ACCEPTED", "CANCELLED"].includes(booking.status)) {
        return NextResponse.json(
          { error: `Cannot modify ${booking.status.toLowerCase()} booking` },
          { status: 400 }
        );
      }
    }

    // Update booking
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }

    if (terms) {
      // Merge new terms with existing terms
      updateData.terms = {
        ...(booking.terms as any),
        ...terms,
        history: [
          ...((booking.terms as any).history || []),
          {
            updatedBy: user.id,
            updatedAt: new Date().toISOString(),
            note,
            changes: terms,
          },
        ],
      };
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
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
            media: {
              orderBy: { sort: "asc" },
              take: 1,
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
        contract: true,
        escrow: true,
      },
    });

    // TODO: Send email notification to relevant parties

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        vessel: {
          include: {
            owner: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const isOperator = booking.operatorId === user.id;
    const isOwner = booking.vessel.owner.id === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOperator && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Cannot cancel accepted bookings (must go through proper cancellation flow)
    if (booking.status === "ACCEPTED") {
      return NextResponse.json(
        { error: "Cannot cancel accepted booking. Please contact support." },
        { status: 400 }
      );
    }

    // Update status to cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel booking" },
      { status: 500 }
    );
  }
}

