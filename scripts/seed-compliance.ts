import { PrismaClient, ComplianceType, ComplianceStatus } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding compliance data...");

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    console.error("❌ No admin user found. Please run the main seed script first.");
    return;
  }

  // Create a sample vessel if none exists
  let vessel = await prisma.vessel.findFirst();

  if (!vessel) {
    const owner = await prisma.user.findFirst({
      where: { role: "OWNER" },
    });

    if (!owner) {
      console.error("❌ No owner user found. Please run the main seed script first.");
      return;
    }

    vessel = await prisma.vessel.create({
      data: {
        ownerId: owner.id,
        slug: "sample-vessel-001",
        type: "Cargo",
        specs: {
          length: 150,
          beam: 25,
          draft: 8,
          grossTonnage: 5000,
          deadweight: 7500,
          yearBuilt: 2015,
        },
        homePort: "Lagos, Nigeria",
        emissions: {
          co2PerNm: 12.5,
          noxCompliant: true,
          soxCompliant: true,
        },
        status: "ACTIVE",
      },
    });

    console.log("✅ Created sample vessel");
  }

  // Create compliance records
  const complianceTypes: ComplianceType[] = [
    "NIMASA",
    "NIPEX",
    "SOLAS",
    "IMO",
    "FLAG_STATE",
    "PORT_STATE",
    "INSURANCE",
    "CREW_CERT",
  ];

  const complianceRecords = [];

  for (const type of complianceTypes) {
    // Create a verified record
    const verified = await prisma.complianceRecord.create({
      data: {
        vesselId: vessel.id,
        type,
        status: "VERIFIED",
        verifiedBy: admin.id,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        notes: `${type} compliance verified and approved`,
        metadata: {
          verificationMethod: "Document Review",
          certificateNumber: `${type}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        },
      },
    });

    // Create verification log
    await prisma.verificationLog.create({
      data: {
        complianceId: verified.id,
        action: `Status changed to VERIFIED`,
        performedBy: admin.id,
        notes: `Initial verification of ${type} compliance`,
        metadata: {
          previousStatus: "PENDING",
          newStatus: "VERIFIED",
        },
      },
    });

    complianceRecords.push(verified);
    console.log(`✅ Created VERIFIED ${type} compliance record`);
  }

  // Create some expiring records
  const expiringTypes: ComplianceType[] = ["SOLAS", "INSURANCE"];

  for (const type of expiringTypes) {
    const expiring = await prisma.complianceRecord.create({
      data: {
        vesselId: vessel.id,
        type,
        status: "VERIFIED",
        verifiedBy: admin.id,
        verifiedAt: new Date(Date.now() - 335 * 24 * 60 * 60 * 1000), // 335 days ago
        expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now (expiring soon!)
        notes: `${type} compliance - expiring soon`,
        metadata: {
          verificationMethod: "Document Review",
          certificateNumber: `${type}-EXPIRING-${Math.random().toString(36).substring(7).toUpperCase()}`,
        },
      },
    });

    await prisma.verificationLog.create({
      data: {
        complianceId: expiring.id,
        action: `Status changed to VERIFIED`,
        performedBy: admin.id,
        notes: `Verification of ${type} compliance (now expiring soon)`,
        metadata: {
          previousStatus: "PENDING",
          newStatus: "VERIFIED",
        },
      },
    });

    console.log(`⚠️  Created EXPIRING ${type} compliance record`);
  }

  // Create a pending record
  const pending = await prisma.complianceRecord.create({
    data: {
      vesselId: vessel.id,
      type: "FLAG_STATE",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      notes: "Awaiting verification",
      metadata: {
        submittedDocuments: ["flag_state_cert.pdf", "registration.pdf"],
      },
    },
  });

  console.log(`⏳ Created PENDING FLAG_STATE compliance record`);

  // Create a rejected record
  const rejected = await prisma.complianceRecord.create({
    data: {
      vesselId: vessel.id,
      type: "CREW_CERT",
      status: "REJECTED",
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      notes: "Crew certification documents are incomplete. Missing captain's license.",
      metadata: {
        rejectionReason: "Incomplete documentation",
        missingDocuments: ["captain_license.pdf"],
      },
    },
  });

  await prisma.verificationLog.create({
    data: {
      complianceId: rejected.id,
      action: `Status changed to REJECTED`,
      performedBy: admin.id,
      notes: "Crew certification documents are incomplete. Missing captain's license.",
      metadata: {
        previousStatus: "PENDING",
        newStatus: "REJECTED",
      },
    },
  });

  console.log(`❌ Created REJECTED CREW_CERT compliance record`);

  // Create document hashes for some compliance records
  const documentUrls = [
    "https://storage.bluefleet.com/docs/nimasa-cert-001.pdf",
    "https://storage.bluefleet.com/docs/solas-cert-001.pdf",
    "https://storage.bluefleet.com/docs/insurance-policy-001.pdf",
    "https://storage.bluefleet.com/docs/imo-cert-001.pdf",
  ];

  for (const url of documentUrls) {
    // Generate a mock SHA-256 hash (in production, this would be the actual hash)
    const mockHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    await prisma.documentHash.create({
      data: {
        documentUrl: url,
        hash: mockHash,
        algorithm: "SHA-256",
        uploadedBy: admin.id,
        vesselId: vessel.id,
        metadata: {
          fileSize: Math.floor(Math.random() * 1000000) + 100000,
          mimeType: "application/pdf",
        },
      },
    });

    console.log(`🔐 Created document hash for ${url.split("/").pop()}`);
  }

  console.log("\n✅ Compliance data seeding complete!");
  console.log(`\n📊 Summary:`);
  console.log(`   - ${complianceRecords.length} verified compliance records`);
  console.log(`   - 2 expiring compliance records (within 30 days)`);
  console.log(`   - 1 pending compliance record`);
  console.log(`   - 1 rejected compliance record`);
  console.log(`   - ${documentUrls.length} document hashes`);
  console.log(`\n🔗 Visit http://localhost:3001/admin/compliance to view the dashboard`);
  console.log(`🔗 Visit http://localhost:3001/compliance for regulator view`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding compliance data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

