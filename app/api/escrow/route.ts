import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  escrowInitiationSchema,
  calculateEscrowAmounts,
  generatePaystackPayload,
  generateFlutterwavePayload,
  generateTransactionReference,
} from "@/lib/validators/escrow";

// GET /api/escrow - List escrow transactions
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
    // Admins can see all transactions

    const transactions = await prisma.escrowTransaction.findMany({
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

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Error fetching escrow transactions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch escrow transactions" },
      { status: 500 }
    );
  }
}

// POST /api/escrow - Initialize escrow payment
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request
    const validation = escrowInitiationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { bookingId, provider, currency } = validation.data;

    // Only operators can initiate escrow payments
    if (user.role !== "OPERATOR") {
      return NextResponse.json(
        { error: "Only operators can initiate escrow payments" },
        { status: 403 }
      );
    }

    // Check if escrow already exists
    const existingEscrow = await prisma.escrowTransaction.findUnique({
      where: { bookingId },
    });

    if (existingEscrow) {
      return NextResponse.json(
        { error: "Escrow transaction already exists for this booking" },
        { status: 400 }
      );
    }

    // Get booking with contract
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
        contract: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check authorization
    if (booking.operatorId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to pay for this booking" },
        { status: 403 }
      );
    }

    // Booking must be accepted
    if (booking.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Booking must be accepted before payment" },
        { status: 400 }
      );
    }

    // Contract must exist and be fully signed
    if (!booking.contract) {
      return NextResponse.json(
        { error: "Contract must be generated before payment" },
        { status: 400 }
      );
    }

    const isFullySigned =
      booking.contract.signerIds.includes(booking.vessel.ownerId) &&
      booking.contract.signerIds.includes(booking.operatorId);

    if (!isFullySigned) {
      return NextResponse.json(
        { error: "Contract must be fully signed before payment" },
        { status: 400 }
      );
    }

    // Calculate amounts
    const specs = booking.vessel.specs as any;
    const pricing = specs.pricing || {};
    const startDate = new Date(booking.start);
    const endDate = new Date(booking.end);
    const duration = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = (pricing.dailyRate || 0) * duration;
    const securityDeposit = pricing.securityDeposit || 0;
    const grandTotal = totalAmount + securityDeposit;

    const amounts = calculateEscrowAmounts(grandTotal, currency);

    // Generate transaction reference
    const reference = generateTransactionReference(bookingId);

    // Create escrow transaction
    const escrow = await prisma.escrowTransaction.create({
      data: {
        bookingId,
        provider,
        currency,
        amount: amounts.totalAmountMinor,
        fee: amounts.platformFeeMinor,
        status: "PENDING",
        logs: {
          created: {
            timestamp: new Date().toISOString(),
            userId: user.id,
            reference,
          },
        },
      },
    });

    // Initialize payment with provider
    let paymentData: any;

    if (provider === "PAYSTACK") {
      paymentData = generatePaystackPayload(
        user.email,
        amounts.totalAmountMinor,
        currency,
        reference,
        {
          bookingId,
          escrowId: escrow.id,
          userId: user.id,
        }
      );

      // TODO: Call Paystack API to initialize transaction
      // const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(paymentData),
      // });
      // const paystackData = await paystackResponse.json();
      // paymentUrl = paystackData.data.authorization_url;
    } else {
      // Flutterwave
      paymentData = generateFlutterwavePayload(
        user.email,
        amounts.totalAmount,
        currency,
        reference,
        {
          bookingId,
          escrowId: escrow.id,
          userId: user.id,
        }
      );

      // TODO: Call Flutterwave API to initialize transaction
    }

    // For MVP, return mock payment URL
    const paymentUrl = `/payment/mock?reference=${reference}&amount=${amounts.totalAmount}&currency=${currency}`;

    return NextResponse.json(
      {
        escrow,
        paymentUrl,
        reference,
        amounts,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error initializing escrow:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize escrow" },
      { status: 500 }
    );
  }
}

