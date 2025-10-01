import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            vessels: true,
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get KYC status for each user
    const usersWithKyc = await Promise.all(
      users.map(async (user) => {
        const kyc = await prisma.kycRecord.findFirst({
          where: { userId: user.id },
          select: { status: true },
        });

        return {
          ...user,
          kycStatus: kyc?.status || "NOT_STARTED",
        };
      })
    );

    return NextResponse.json({ users: usersWithKyc });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

