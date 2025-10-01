import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// Load environment variables
config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo data...\n");

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create demo admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@bluefleet.com" },
    update: {},
    create: {
      email: "admin@bluefleet.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN"
    }
  });
  console.log("✅ Created admin user:", admin.email);

  // Create demo owner user
  const owner = await prisma.user.upsert({
    where: { email: "owner@bluefleet.com" },
    update: {},
    create: {
      email: "owner@bluefleet.com",
      password: hashedPassword,
      name: "Vessel Owner",
      role: "OWNER"
    }
  });
  console.log("✅ Created owner user:", owner.email);

  // Create demo operator user
  const operator = await prisma.user.upsert({
    where: { email: "operator@bluefleet.com" },
    update: {},
    create: {
      email: "operator@bluefleet.com",
      password: hashedPassword,
      name: "Fleet Operator",
      role: "OPERATOR"
    }
  });
  console.log("✅ Created operator user:", operator.email);

  // Create demo regulator user
  const regulator = await prisma.user.upsert({
    where: { email: "regulator@bluefleet.com" },
    update: {},
    create: {
      email: "regulator@bluefleet.com",
      password: hashedPassword,
      name: "Maritime Regulator",
      role: "REGULATOR"
    }
  });
  console.log("✅ Created regulator user:", regulator.email);

  console.log("\n🎉 Seeding complete!");
  console.log("\nDemo credentials (all users):");
  console.log("  Password: password123\n");
  console.log("Users:");
  console.log("  - admin@bluefleet.com (Admin)");
  console.log("  - owner@bluefleet.com (Owner)");
  console.log("  - operator@bluefleet.com (Operator)");
  console.log("  - regulator@bluefleet.com (Regulator)\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
