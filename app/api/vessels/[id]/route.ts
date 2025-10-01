import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/vessels/[id] - Get vessel by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vessel = await prisma.vessel.findUnique({
      where: { id: params.id },
      include: {
        media: {
          orderBy: { sort: "asc" },
        },
        certs: true,
        availability: true,
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

    return NextResponse.json({ vessel });
  } catch (error) {
    console.error("Error fetching vessel:", error);
    return NextResponse.json(
      { error: "Failed to fetch vessel" },
      { status: 500 }
    );
  }
}

// PATCH /api/vessels/[id] - Update vessel
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(["OWNER", "ADMIN"]);
    const body = await req.json();

    // Get existing vessel
    const existing = await prisma.vessel.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Vessel not found" },
        { status: 404 }
      );
    }

    // Check ownership (unless admin)
    if (user.role !== "ADMIN" && existing.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { specs, emissions, pricing, media, certifications, availability, status } = body;

    // Combine specs, emissions, and pricing
    const vesselSpecs = specs ? {
      ...specs,
      emissions,
      pricing,
    } : existing.specs;

    // Update vessel
    const vessel = await prisma.vessel.update({
      where: { id: params.id },
      data: {
        type: specs?.type || existing.type,
        homePort: specs?.homePort || existing.homePort,
        specs: vesselSpecs,
        emissions: emissions || existing.emissions,
        status: status || existing.status,
      },
    });

    // Update media if provided
    if (media) {
      // Delete existing media
      await prisma.vesselMedia.deleteMany({
        where: { vesselId: params.id },
      });

      // Create new media
      await prisma.vesselMedia.createMany({
        data: media.map((m: any, index: number) => ({
          vesselId: params.id,
          url: m.url,
          alt: m.alt || "",
          sort: index,
        })),
      });
    }

    // Update certifications if provided
    if (certifications) {
      // Delete existing certs
      await prisma.certification.deleteMany({
        where: { vesselId: params.id },
      });

      // Create new certs
      await prisma.certification.createMany({
        data: certifications.map((cert: any) => ({
          vesselId: params.id,
          kind: cert.kind,
          issuer: cert.issuer,
          number: cert.number,
          issuedAt: cert.issuedAt ? new Date(cert.issuedAt) : null,
          expiresAt: cert.expiresAt ? new Date(cert.expiresAt) : null,
          docUrl: cert.docUrl,
          hash: cert.hash || "",
          status: cert.status || "PENDING",
        })),
      });
    }

    // Update availability if provided
    if (availability) {
      // Delete existing availability
      await prisma.availabilitySlot.deleteMany({
        where: { vesselId: params.id },
      });

      // Create new availability
      await prisma.availabilitySlot.createMany({
        data: availability.map((slot: any) => ({
          vesselId: params.id,
          start: new Date(slot.start),
          end: new Date(slot.end),
        })),
      });
    }

    // Fetch updated vessel
    const updatedVessel = await prisma.vessel.findUnique({
      where: { id: params.id },
      include: {
        media: {
          orderBy: { sort: "asc" },
        },
        certs: true,
        availability: true,
      },
    });

    return NextResponse.json({ vessel: updatedVessel });
  } catch (error) {
    console.error("Error updating vessel:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update vessel" },
      { status: 500 }
    );
  }
}

// DELETE /api/vessels/[id] - Delete vessel
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(["OWNER", "ADMIN"]);

    // Get existing vessel
    const existing = await prisma.vessel.findUnique({
      where: { id: params.id },
      include: {
        bookings: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Vessel not found" },
        { status: 404 }
      );
    }

    // Check ownership (unless admin)
    if (user.role !== "ADMIN" && existing.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Check for active bookings
    const activeBookings = existing.bookings.filter(
      (b) => b.status === "ACCEPTED" || b.status === "REQUESTED"
    );

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete vessel with active bookings" },
        { status: 400 }
      );
    }

    // Delete vessel (cascade will delete related records)
    await prisma.vessel.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vessel:", error);
    return NextResponse.json(
      { error: "Failed to delete vessel" },
      { status: 500 }
    );
  }
}

