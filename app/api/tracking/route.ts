import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { trackingEventSchema, trackingQuerySchema } from "@/lib/validators/tracking";

// GET /api/tracking - Get tracking events
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const vesselId = searchParams.get("vesselId");
    const bookingId = searchParams.get("bookingId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Validate query
    const validation = trackingQuerySchema.safeParse({
      vesselId,
      bookingId,
      startDate,
      endDate,
      limit,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {};

    if (vesselId) {
      where.vesselId = vesselId;
    }

    if (bookingId) {
      where.bookingId = bookingId;
    }

    if (startDate || endDate) {
      where.ts = {};
      if (startDate) {
        where.ts.gte = new Date(startDate);
      }
      if (endDate) {
        where.ts.lte = new Date(endDate);
      }
    }

    // Fetch tracking events
    const events = await prisma.trackingEvent.findMany({
      where,
      orderBy: {
        ts: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Error fetching tracking events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tracking events" },
      { status: 500 }
    );
  }
}

// POST /api/tracking - Create tracking event (manual or from cron)
export async function POST(request: NextRequest) {
  try {
    // For cron jobs, we'll use an API key instead of user auth
    const apiKey = request.headers.get("x-api-key");
    const cronSecret = process.env.CRON_SECRET;

    let isAuthorized = false;

    // Check if request is from cron job
    if (apiKey && cronSecret && apiKey === cronSecret) {
      isAuthorized = true;
    } else {
      // Otherwise require user authentication
      try {
        const user = await requireAuth();
        // Only admins can manually create tracking events
        if (user.role === "ADMIN") {
          isAuthorized = true;
        }
      } catch (error) {
        // Not authorized
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request
    const validation = trackingEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { vesselId, bookingId, lat, lng, ts, provider, meta } = validation.data;

    // Create tracking event
    const event = await prisma.trackingEvent.create({
      data: {
        vesselId,
        bookingId,
        lat,
        lng,
        ts: new Date(ts),
        provider,
        meta: meta || {},
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tracking event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create tracking event" },
      { status: 500 }
    );
  }
}

