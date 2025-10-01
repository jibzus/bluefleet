import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["OWNER", "OPERATOR", "ADMIN", "REGULATOR"]).optional(),
  name: z.string().min(1).optional(),
});

// GET /api/admin/users/[id] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        kyc: true,
        vessels: {
          select: {
            id: true,
            slug: true,
            type: true,
            specs: true,
            status: true,
            createdAt: true,
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            start: true,
            end: true,
            createdAt: true,
            vessel: {
              select: {
                id: true,
                slug: true,
                type: true,
                specs: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = params;
    const body = await request.json();

    // Validate request
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: validation.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

