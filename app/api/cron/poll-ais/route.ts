import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchVesselPosition } from "@/lib/validators/tracking";

// GET /api/cron/poll-ais - Cron job to poll AIS data for active charters
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active bookings (ACCEPTED status with escrow FUNDED)
    const activeBookings = await prisma.booking.findMany({
      where: {
        status: "ACCEPTED",
        start: {
          lte: new Date(), // Charter has started
        },
        end: {
          gte: new Date(), // Charter hasn't ended
        },
        escrow: {
          status: "FUNDED", // Payment confirmed
        },
      },
      include: {
        vessel: true,
        escrow: true,
      },
    });

    console.log(`Found ${activeBookings.length} active charters to track`);

    const results = [];

    // Poll AIS data for each active charter
    for (const booking of activeBookings) {
      try {
        const vessel = booking.vessel;
        const specs = vessel.specs as any;

        // Get MMSI from vessel specs (required for AIS tracking)
        const mmsi = specs.mmsi || specs.imoNumber;

        if (!mmsi) {
          console.warn(`Vessel ${vessel.id} has no MMSI/IMO number, skipping`);
          results.push({
            vesselId: vessel.id,
            bookingId: booking.id,
            status: "skipped",
            reason: "No MMSI/IMO number",
          });
          continue;
        }

        // Fetch position from AIS providers
        const position = await fetchVesselPosition(mmsi, vessel.id);

        if (!position) {
          console.warn(`No position data for vessel ${vessel.id}`);
          results.push({
            vesselId: vessel.id,
            bookingId: booking.id,
            status: "no_data",
            reason: "No position data from providers",
          });
          continue;
        }

        // Store tracking event
        const event = await prisma.trackingEvent.create({
          data: {
            vesselId: vessel.id,
            bookingId: booking.id,
            lat: position.lat,
            lng: position.lng,
            ts: position.timestamp,
            provider: position.provider,
            meta: position.meta,
          },
        });

        results.push({
          vesselId: vessel.id,
          bookingId: booking.id,
          status: "success",
          eventId: event.id,
          provider: position.provider,
        });

        console.log(
          `Tracked vessel ${vessel.id} at ${position.lat}, ${position.lng} via ${position.provider}`
        );
      } catch (error) {
        console.error(`Error tracking vessel ${booking.vessel.id}:`, error);
        results.push({
          vesselId: booking.vessel.id,
          bookingId: booking.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      tracked: results.filter((r) => r.status === "success").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      failed: results.filter((r) => r.status === "error" || r.status === "no_data").length,
      results,
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: error.message || "Cron job failed" },
      { status: 500 }
    );
  }
}

