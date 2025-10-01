import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚢 Seeding vessels...");

  // Get the owner user
  const owner = await prisma.user.findFirst({
    where: { email: "owner@bluefleet.com" },
  });

  if (!owner) {
    console.error("❌ Owner user not found. Please run seed script first.");
    return;
  }

  // Create vessels
  const vessels = [
    {
      slug: "mv-atlantic-star-cargo",
      type: "Cargo",
      homePort: "Lagos, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "MV Atlantic Star",
        type: "Cargo",
        length: 150,
        beam: 25,
        draft: 8,
        grossTonnage: 5000,
        deadweight: 7500,
        yearBuilt: 2015,
        flag: "Nigeria",
        imoNumber: "IMO 9876543",
        callSign: "5NAB",
        homePort: "Lagos, Nigeria",
        description: "Modern cargo vessel with excellent fuel efficiency and advanced navigation systems. Suitable for coastal and international shipping.",
        emissions: {
          co2PerNm: 12.5,
          noxCompliant: true,
          soxCompliant: true,
          eediRating: "A",
        },
        pricing: {
          dailyRate: 5000,
          currency: "USD",
          minimumDays: 3,
          securityDeposit: 10000,
          fuelIncluded: false,
          crewIncluded: true,
        },
      },
      emissions: {
        co2PerNm: 12.5,
        noxCompliant: true,
        soxCompliant: true,
        eediRating: "A",
      },
      media: [
        {
          url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800",
          alt: "MV Atlantic Star - Main View",
          sort: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800",
          alt: "MV Atlantic Star - Deck View",
          sort: 1,
        },
      ],
      certs: [
        {
          kind: "SOLAS",
          issuer: "Lloyd's Register",
          number: "SOLAS-2024-001",
          issuedAt: new Date("2024-01-15"),
          expiresAt: new Date("2025-01-15"),
          hash: "abc123",
          status: "PENDING",
        },
        {
          kind: "NIMASA",
          issuer: "NIMASA",
          number: "NIM-2024-5678",
          issuedAt: new Date("2024-02-01"),
          expiresAt: new Date("2025-02-01"),
          hash: "def456",
          status: "PENDING",
        },
      ],
      availability: [
        {
          start: new Date("2025-01-01"),
          end: new Date("2025-03-31"),
        },
        {
          start: new Date("2025-05-01"),
          end: new Date("2025-07-31"),
        },
      ],
    },
    {
      slug: "mv-pacific-queen-tanker",
      type: "Tanker",
      homePort: "Port Harcourt, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "MV Pacific Queen",
        type: "Tanker",
        length: 180,
        beam: 30,
        draft: 10,
        grossTonnage: 8000,
        deadweight: 12000,
        yearBuilt: 2018,
        flag: "Nigeria",
        imoNumber: "IMO 9876544",
        callSign: "5NAC",
        homePort: "Port Harcourt, Nigeria",
        description: "State-of-the-art oil tanker with double hull construction and advanced safety systems. Fully compliant with international maritime regulations.",
        emissions: {
          co2PerNm: 15.2,
          noxCompliant: true,
          soxCompliant: true,
          eediRating: "B",
        },
        pricing: {
          dailyRate: 8000,
          currency: "USD",
          minimumDays: 5,
          securityDeposit: 20000,
          fuelIncluded: false,
          crewIncluded: true,
        },
      },
      emissions: {
        co2PerNm: 15.2,
        noxCompliant: true,
        soxCompliant: true,
        eediRating: "B",
      },
      media: [
        {
          url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
          alt: "MV Pacific Queen - Main View",
          sort: 0,
        },
      ],
      certs: [
        {
          kind: "IMO",
          issuer: "IMO",
          number: "IMO-2024-9999",
          issuedAt: new Date("2024-03-01"),
          expiresAt: new Date("2025-03-01"),
          hash: "ghi789",
          status: "PENDING",
        },
      ],
      availability: [
        {
          start: new Date("2025-02-01"),
          end: new Date("2025-04-30"),
        },
      ],
    },
    {
      slug: "mv-coastal-runner-supply",
      type: "Supply",
      homePort: "Warri, Nigeria",
      status: "DRAFT",
      specs: {
        name: "MV Coastal Runner",
        type: "Supply",
        length: 80,
        beam: 18,
        draft: 5,
        grossTonnage: 2000,
        deadweight: 3000,
        yearBuilt: 2020,
        flag: "Nigeria",
        homePort: "Warri, Nigeria",
        description: "Fast and efficient supply vessel for offshore operations. Equipped with modern cargo handling equipment.",
        emissions: {
          co2PerNm: 8.5,
          noxCompliant: true,
          soxCompliant: true,
        },
        pricing: {
          dailyRate: 3500,
          currency: "USD",
          minimumDays: 2,
          securityDeposit: 5000,
          fuelIncluded: true,
          crewIncluded: true,
        },
      },
      emissions: {
        co2PerNm: 8.5,
        noxCompliant: true,
        soxCompliant: true,
      },
      media: [
        {
          url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800",
          alt: "MV Coastal Runner",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
  ];

  for (const vesselData of vessels) {
    const { media, certs, availability, ...vesselInfo } = vesselData;

    const vessel = await prisma.vessel.create({
      data: {
        ...vesselInfo,
        ownerId: owner.id,
        media: {
          create: media,
        },
        certs: {
          create: certs,
        },
        availability: {
          create: availability,
        },
      },
    });

    console.log(`✅ Created vessel: ${vesselInfo.specs.name} (${vessel.id})`);
  }

  console.log("✅ Vessel seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding vessels:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

