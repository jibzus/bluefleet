import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyPaystackSignature,
  verifyFlutterwaveSignature,
} from "@/lib/validators/escrow";

// POST /api/payments/webhook - Handle payment provider webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";
    const flutterwaveSignature = request.headers.get("verif-hash") || "";

    let provider: "PAYSTACK" | "FLUTTERWAVE" | null = null;
    let isValid = false;

    // Determine provider and verify signature
    if (signature) {
      provider = "PAYSTACK";
      isValid = verifyPaystackSignature(body, signature);
    } else if (flutterwaveSignature) {
      provider = "FLUTTERWAVE";
      isValid = verifyFlutterwaveSignature(body, flutterwaveSignature);
    }

    if (!provider || !isValid) {
      console.error("Invalid webhook signature");
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle Paystack webhook
    if (provider === "PAYSTACK") {
      if (event.event === "charge.success") {
        const { reference, metadata } = event.data;
        const { escrowId } = metadata;

        // Update escrow transaction
        const escrow = await prisma.escrowTransaction.findUnique({
          where: { id: escrowId },
        });

        if (escrow) {
          const logs = escrow.logs as any;
          await prisma.escrowTransaction.update({
            where: { id: escrowId },
            data: {
              status: "FUNDED",
              logs: {
                ...logs,
                funded: {
                  timestamp: new Date().toISOString(),
                  provider: "PAYSTACK",
                  reference,
                  event: event.event,
                },
              },
            },
          });
        }
      }
    }

    // Handle Flutterwave webhook
    if (provider === "FLUTTERWAVE") {
      if (event.event === "charge.completed" && event.data.status === "successful") {
        const { tx_ref, meta } = event.data;
        const { escrowId } = meta;

        // Update escrow transaction
        const escrow = await prisma.escrowTransaction.findUnique({
          where: { id: escrowId },
        });

        if (escrow) {
          const logs = escrow.logs as any;
          await prisma.escrowTransaction.update({
            where: { id: escrowId },
            data: {
              status: "FUNDED",
              logs: {
                ...logs,
                funded: {
                  timestamp: new Date().toISOString(),
                  provider: "FLUTTERWAVE",
                  reference: tx_ref,
                  event: event.event,
                },
              },
            },
          });
        }
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}
