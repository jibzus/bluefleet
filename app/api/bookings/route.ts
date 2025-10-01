import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { bookingRequestSchema, validateBookingAvailability, checkDateOverlap } from "@/lib/validators/booking";

// GET /api/bookings - List bookings for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get("status");
    const vesselId = searchParams.get("vesselId");

    // Build where clause based on user role
    const where: any = {};

    if (user.role === "OPERATOR") {
      // Operators see their own bookings
      where.operatorId = user.id;
    } else if (user.role === "OWNER") {
      // Owners see bookings for their vessels
      where.vessel = {
        ownerId: user.id,
      };
    } else if (user.role === "ADMIN") {
      // Admins see all bookings
      // No additional filter
    } else {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Apply filters
    if (status) {
      where.status = status;
    }

    if (vesselId) {
      where.vesselId = vesselId;
    }

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        vessel: {
          select: {
            id: true,
            slug: true,
            type: true,
            specs: true,
            homePort: true,
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
        contract: true,
        escrow: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking request
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Only operators can create booking requests
    if (user.role !== "OPERATOR") {
      return NextResponse.json(
        { error: "Only operators can create booking requests" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = bookingRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { vesselId, start, end, terms } = validation.data;

    // Fetch vessel with availability and existing bookings
    const vessel = await prisma.vessel.findUnique({
      where: { id: vesselId },
      include: {
        availability: true,
        bookings: {
          where: {
            status: {
              in: ["REQUESTED", "COUNTERED", "ACCEPTED"],
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!vessel) {
      return NextResponse.json(
        { error: "Vessel not found" },
        { status: 404 }
      );
    }

    // Check if vessel is active
    if (vessel.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Vessel is not available for booking" },
        { status: 400 }
      );
    }

    // Check if operator is trying to book their own vessel
    if (vessel.owner.id === user.id) {
      return NextResponse.json(
        { error: "You cannot book your own vessel" },
        { status: 400 }
      );
    }

    // Validate against availability slots
    if (vessel.availability.length > 0) {
      const isAvailable = validateBookingAvailability(
        start,
        end,
        vessel.availability
      );

      if (!isAvailable) {
        return NextResponse.json(
          { error: "Requested dates are not within vessel availability" },
          { status: 400 }
        );
      }
    }

    // Check for overlapping bookings
    const hasOverlap = vessel.bookings.some((booking) =>
      checkDateOverlap(start, end, booking.start, booking.end)
    );

    if (hasOverlap) {
      return NextResponse.json(
        { error: "Requested dates overlap with existing booking" },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        vesselId,
        operatorId: user.id,
        start: new Date(start),
        end: new Date(end),
        terms,
        status: "REQUESTED",
      },
      include: {
        vessel: {
          select: {
            id: true,
            slug: true,
            type: true,
            specs: true,
            homePort: true,
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

    // TODO: Send email notification to vessel owner

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

