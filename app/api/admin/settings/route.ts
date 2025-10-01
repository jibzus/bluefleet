import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { z } from "zod";

// Platform settings (in-memory for MVP, should be in database for production)
let platformSettings = {
  platformFeePercentage: 7,
  currency: "NGN",
  paystackEnabled: true,
  flutterwaveEnabled: true,
  aisPollingInterval: 15, // minutes
  expiryAlertDays: 30,
  maintenanceMode: false,
  signupEnabled: true,
  bookingEnabled: true,
};

const updateSettingsSchema = z.object({
  platformFeePercentage: z.number().min(0).max(100).optional(),
  currency: z.enum(["NGN", "USD"]).optional(),
  paystackEnabled: z.boolean().optional(),
  flutterwaveEnabled: z.boolean().optional(),
  aisPollingInterval: z.number().min(5).max(60).optional(),
  expiryAlertDays: z.number().min(1).max(90).optional(),
  maintenanceMode: z.boolean().optional(),
  signupEnabled: z.boolean().optional(),
  bookingEnabled: z.boolean().optional(),
});

// GET /api/admin/settings - Get platform settings
export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    return NextResponse.json({ settings: platformSettings });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings - Update platform settings
export async function PATCH(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();

    // Validate request
    const validation = updateSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Update settings
    platformSettings = {
      ...platformSettings,
      ...validation.data,
    };

    return NextResponse.json({ settings: platformSettings });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

