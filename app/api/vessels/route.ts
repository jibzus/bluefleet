import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateVesselSlug } from "@/lib/validators/vessel";

// GET /api/vessels - List vessels
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");
    const status = searchParams.get("status");

    const where: any = {};
    if (ownerId) where.ownerId = ownerId;
    if (status) where.status = status;

    const vessels = await prisma.vessel.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ vessels });
  } catch (error) {
    console.error("Error fetching vessels:", error);
    return NextResponse.json(
      { error: "Failed to fetch vessels" },
      { status: 500 }
    );
  }
}

// POST /api/vessels - Create vessel
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["OWNER", "ADMIN"]);
    const body = await req.json();

    const { specs, emissions, pricing, media, certifications, availability, status } = body;

    // Validate required fields
    if (!specs?.name || !specs?.type || !specs?.homePort) {
      return NextResponse.json(
        { error: "Missing required specifications" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = generateVesselSlug(specs.name, specs.imoNumber);

    // Check if slug already exists
    const existing = await prisma.vessel.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A vessel with this name already exists" },
        { status: 400 }
      );
    }

    // Combine specs, emissions, and pricing into specs JSON
    const vesselSpecs = {
      ...specs,
      emissions,
      pricing,
    };

    // Create vessel
    const vessel = await prisma.vessel.create({
      data: {
        ownerId: user.id,
        slug,
        type: specs.type,
        homePort: specs.homePort,
        specs: vesselSpecs,
        emissions: emissions || {},
        status: status || "DRAFT",
        media: {
          create: media?.map((m: any, index: number) => ({
            url: m.url,
            alt: m.alt || "",
            sort: index,
          })) || [],
        },
        certs: {
          create: certifications?.map((cert: any) => ({
            kind: cert.kind,
            issuer: cert.issuer,
            number: cert.number,
            issuedAt: cert.issuedAt ? new Date(cert.issuedAt) : null,
            expiresAt: cert.expiresAt ? new Date(cert.expiresAt) : null,
            docUrl: cert.docUrl,
            hash: cert.hash || "",
            status: cert.status || "PENDING",
          })) || [],
        },
        availability: {
          create: availability?.map((slot: any) => ({
            start: new Date(slot.start),
            end: new Date(slot.end),
          })) || [],
        },
      },
      include: {
        media: true,
        certs: true,
        availability: true,
      },
    });

    return NextResponse.json({ vessel }, { status: 201 });
  } catch (error) {
    console.error("Error creating vessel:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create vessel" },
      { status: 500 }
    );
  }
}
