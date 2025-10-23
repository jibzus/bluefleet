import { PrismaClient, BookingStatus } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

// Helper function to generate mock SHA-256 hash
function generateMockHash(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Helper function to generate random date within range
function randomDateBetween(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate booking terms
function generateTerms(dailyRate: number, numberOfDays: number) {
  const subtotal = dailyRate * numberOfDays;
  const securityDeposit = subtotal * (0.2 + Math.random() * 0.1); // 20-30%
  const platformFee = subtotal * 0.07; // 7%
  const totalCost = subtotal + platformFee;

  return {
    dailyRate,
    numberOfDays,
    subtotal,
    securityDeposit,
    platformFee,
    totalCost,
    currency: "NGN",
  };
}

// Helper function to generate escrow logs
function generateEscrowLogs(status: string) {
  const logs = [
    {
      timestamp: new Date().toISOString(),
      event: "TRANSACTION_INITIATED",
      details: "Escrow transaction created",
    },
  ];

  if (status === "FUNDED" || status === "RELEASED") {
    logs.push({
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      event: "PAYMENT_RECEIVED",
      details: "Payment received from operator",
    });
  }

  if (status === "RELEASED") {
    logs.push({
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      event: "FUNDS_RELEASED",
      details: "Funds released to vessel owner",
    });
  }

  return logs;
}

// Vessel type to daily rate mapping (in NGN)
const vesselTypeRates: Record<string, { min: number; max: number }> = {
  PSV: { min: 200000, max: 300000 },
  Cargo: { min: 100000, max: 180000 },
  Tanker: { min: 150000, max: 250000 },
  AHTS: { min: 180000, max: 280000 },
  Tug: { min: 80000, max: 150000 },
};

async function main() {
  console.log("🌱 Seeding analytics data...\n");

  try {
    // Fetch existing users
    const operator = await prisma.user.findFirst({
      where: { email: "operator@bluefleet.com" },
    });

    const owner = await prisma.user.findFirst({
      where: { email: "owner@bluefleet.com" },
    });

    if (!operator || !owner) {
      console.error("❌ Required users not found. Please run seed script first.");
      console.error("   - operator@bluefleet.com");
      console.error("   - owner@bluefleet.com");
      return;
    }

    // Fetch existing vessels
    const vessels = await prisma.vessel.findMany({
      where: { ownerId: owner.id },
    });

    if (vessels.length === 0) {
      console.error("❌ No vessels found. Please run seed-vessels script first.");
      return;
    }

    console.log(`✅ Found ${vessels.length} vessels`);
    console.log(`✅ Using operator: ${operator.email}`);
    console.log(`✅ Using owner: ${owner.email}\n`);

    // Check if analytics data already exists
    const existingBookings = await prisma.booking.findMany({
      where: { operatorId: operator.id },
    });

    if (existingBookings.length > 0) {
      console.log(`⚠️  Found ${existingBookings.length} existing bookings for this operator.`);
      console.log("   Proceeding to add more bookings...\n");
    }

    // Generate bookings across last 9 months
    const bookingsToCreate = 45;
    const today = new Date();
    const nineMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 9, today.getDate());

    console.log(`📅 Creating ${bookingsToCreate} bookings from ${nineMonthsAgo.toDateString()} to ${today.toDateString()}\n`);

    const bookingStatuses: BookingStatus[] = ["REQUESTED", "COUNTERED", "ACCEPTED", "CANCELLED"];
    const statusDistribution = {
      ACCEPTED: 0.45,
      REQUESTED: 0.25,
      COUNTERED: 0.15,
      CANCELLED: 0.15,
    };

    let createdBookings = 0;
    let createdEscrows = 0;
    let createdContracts = 0;

    for (let i = 0; i < bookingsToCreate; i++) {
      // Select random vessel
      const vessel = vessels[Math.floor(Math.random() * vessels.length)];

      // Generate booking dates
      const bookingCreatedAt = randomDateBetween(nineMonthsAgo, today);
      const charterDays = Math.floor(Math.random() * 38) + 7; // 7-45 days
      const charterStart = new Date(bookingCreatedAt);
      charterStart.setDate(charterStart.getDate() + Math.floor(Math.random() * 30)); // Start within 30 days
      const charterEnd = new Date(charterStart);
      charterEnd.setDate(charterEnd.getDate() + charterDays);

      // Determine booking status based on distribution
      let status: BookingStatus = "REQUESTED";
      const rand = Math.random();
      if (rand < statusDistribution.ACCEPTED) status = "ACCEPTED";
      else if (rand < statusDistribution.ACCEPTED + statusDistribution.REQUESTED) status = "REQUESTED";
      else if (rand < statusDistribution.ACCEPTED + statusDistribution.REQUESTED + statusDistribution.COUNTERED)
        status = "COUNTERED";
      else status = "CANCELLED";

      // Generate daily rate based on vessel type
      const vesselType = vessel.type || "PSV";
      const rateRange = vesselTypeRates[vesselType] || { min: 150000, max: 250000 };
      const dailyRate = Math.floor(Math.random() * (rateRange.max - rateRange.min) + rateRange.min);

      // Generate terms
      const terms = generateTerms(dailyRate, charterDays);

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          vesselId: vessel.id,
          operatorId: operator.id,
          start: charterStart,
          end: charterEnd,
          terms,
          status,
          createdAt: bookingCreatedAt,
        },
      });

      createdBookings++;

      // Create escrow for ACCEPTED bookings
      if (status === "ACCEPTED") {
        const escrowStatus = Math.random() < 0.6 ? "RELEASED" : Math.random() < 0.75 ? "FUNDED" : "PENDING";
        const amount = Math.round(terms.totalCost * 100); // Convert to kobo
        const fee = Math.round(amount * 0.015); // 1.5% fee

        await prisma.escrowTransaction.create({
          data: {
            bookingId: booking.id,
            provider: Math.random() < 0.5 ? "paystack" : "flutterwave",
            currency: "NGN",
            amount,
            fee,
            status: escrowStatus,
            logs: generateEscrowLogs(escrowStatus),
          },
        });

        createdEscrows++;

        // Create contract for ACCEPTED bookings with FUNDED or RELEASED escrow
        if (escrowStatus === "FUNDED" || escrowStatus === "RELEASED") {
          const signedAt = new Date(bookingCreatedAt);
          signedAt.setDate(signedAt.getDate() + Math.floor(Math.random() * 5)); // Sign within 5 days

          await prisma.contract.create({
            data: {
              bookingId: booking.id,
              version: 1,
              pdfUrl: `https://bluefleet-contracts.s3.amazonaws.com/contract-${booking.id}.pdf`,
              hash: generateMockHash(),
              signedAt,
              signerIds: [operator.id, owner.id],
            },
          });

          createdContracts++;
        }
      }

      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`  ✓ Created ${i + 1}/${bookingsToCreate} bookings...`);
      }
    }

    console.log(`\n✅ Seeding complete!\n`);
    console.log(`📊 Analytics Data Summary:`);
    console.log(`   - Bookings created: ${createdBookings}`);
    console.log(`   - Escrow transactions: ${createdEscrows}`);
    console.log(`   - Contracts: ${createdContracts}`);
    console.log(`\n🎯 Status Distribution:`);
    console.log(`   - ACCEPTED: ~${Math.round(bookingsToCreate * statusDistribution.ACCEPTED)} bookings`);
    console.log(`   - REQUESTED: ~${Math.round(bookingsToCreate * statusDistribution.REQUESTED)} bookings`);
    console.log(`   - COUNTERED: ~${Math.round(bookingsToCreate * statusDistribution.COUNTERED)} bookings`);
    console.log(`   - CANCELLED: ~${Math.round(bookingsToCreate * statusDistribution.CANCELLED)} bookings`);
    console.log(`\n📈 You can now view analytics at:`);
    console.log(`   - Operator: http://localhost:3001/operator/analytics`);
    console.log(`   - Owner: http://localhost:3001/owner/analytics (when implemented)\n`);
  } catch (error: any) {
    console.error("❌ Seeding failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

