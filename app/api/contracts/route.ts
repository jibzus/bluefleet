import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  contractGenerationSchema,
  generateContractTerms,
  generateContractHTML,
} from "@/lib/validators/contract";
import { generatePDF, generatePDFHash, savePDF } from "@/lib/pdf";

// GET /api/contracts - List contracts
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    // Build where clause based on role
    let where: any = {};

    if (bookingId) {
      where.bookingId = bookingId;
    }

    // Role-based filtering
    if (user.role === "OPERATOR") {
      where.booking = {
        operatorId: user.id,
      };
    } else if (user.role === "OWNER") {
      where.booking = {
        vessel: {
          ownerId: user.id,
        },
      };
    }
    // Admins can see all contracts

    const contracts = await prisma.contract.findMany({
      where,
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
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(contracts);
  } catch (error: any) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

// POST /api/contracts - Generate contract from booking
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request
    const validation = contractGenerationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { bookingId } = validation.data;

    // Check if contract already exists
    const existingContract = await prisma.contract.findUnique({
      where: { bookingId },
    });

    if (existingContract) {
      return NextResponse.json(
        { error: "Contract already exists for this booking" },
        { status: 400 }
      );
    }

    // Get booking with all related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only accepted bookings can have contracts
    if (booking.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Only accepted bookings can have contracts" },
        { status: 400 }
      );
    }

    // Check authorization - only owner or operator can generate contract
    const isOwner = booking.vessel.ownerId === user.id;
    const isOperator = booking.operatorId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isOperator && !isAdmin) {
      return NextResponse.json(
        { error: "Not authorized to generate contract for this booking" },
        { status: 403 }
      );
    }

    // Generate contract terms
    const contractTerms = generateContractTerms(booking, booking.vessel);

    // Generate HTML
    const html = generateContractHTML(contractTerms);

    // Generate PDF
    const pdfBuffer = await generatePDF(html);

    // Generate hash
    const hash = generatePDFHash(pdfBuffer);

    // Save PDF (in production, upload to blob storage)
    const pdfUrl = await savePDF(pdfBuffer, `contract-${bookingId}.pdf`);

    // Create contract record
    const contract = await prisma.contract.create({
      data: {
        bookingId,
        version: 1,
        pdfUrl,
        hash,
        signerIds: [], // No signatures yet
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

    return NextResponse.json(contract, { status: 201 });
  } catch (error: any) {
    console.error("Error generating contract:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate contract" },
      { status: 500 }
    );
  }
}

