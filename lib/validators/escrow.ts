import { z } from "zod";

// Escrow Payment Initiation Schema
export const escrowInitiationSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  provider: z.enum(["PAYSTACK", "FLUTTERWAVE"]).default("PAYSTACK"),
  currency: z.enum(["NGN", "USD"]).default("NGN"),
});

// Escrow Status Update Schema (for webhooks)
export const escrowStatusUpdateSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "FUNDED",
    "RELEASED",
    "REFUNDED",
    "FAILED",
    "DISPUTED",
  ]),
  providerReference: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Escrow Release Schema
export const escrowReleaseSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  releaseReason: z.string().min(10, "Please provide a reason (min 10 characters)"),
});

// Escrow Status Type
export type EscrowStatus =
  | "PENDING"
  | "PROCESSING"
  | "FUNDED"
  | "RELEASED"
  | "REFUNDED"
  | "FAILED"
  | "DISPUTED";

// Format escrow status for display
export function formatEscrowStatus(status: string): {
  label: string;
  color: string;
  description: string;
} {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        color: "yellow",
        description: "Awaiting payment",
      };
    case "PROCESSING":
      return {
        label: "Processing",
        color: "blue",
        description: "Payment is being processed",
      };
    case "FUNDED":
      return {
        label: "Funded",
        color: "green",
        description: "Escrow funded successfully",
      };
    case "RELEASED":
      return {
        label: "Released",
        color: "green",
        description: "Payment released to owner",
      };
    case "REFUNDED":
      return {
        label: "Refunded",
        color: "gray",
        description: "Payment refunded to operator",
      };
    case "FAILED":
      return {
        label: "Failed",
        color: "red",
        description: "Payment failed",
      };
    case "DISPUTED":
      return {
        label: "Disputed",
        color: "orange",
        description: "Payment is under dispute",
      };
    default:
      return {
        label: status,
        color: "gray",
        description: "Unknown status",
      };
  }
}

// Calculate escrow amounts
export function calculateEscrowAmounts(
  totalAmount: number,
  currency: string,
  platformFeePercent: number = 7
): {
  totalAmount: number;
  platformFee: number;
  ownerPayout: number;
  currency: string;
  totalAmountMinor: number; // in minor units (kobo/cents)
  platformFeeMinor: number;
  ownerPayoutMinor: number;
} {
  const platformFee = Math.round(totalAmount * (platformFeePercent / 100));
  const ownerPayout = totalAmount - platformFee;

  // Convert to minor units (kobo for NGN, cents for USD)
  const totalAmountMinor = totalAmount * 100;
  const platformFeeMinor = platformFee * 100;
  const ownerPayoutMinor = ownerPayout * 100;

  return {
    totalAmount,
    platformFee,
    ownerPayout,
    currency,
    totalAmountMinor,
    platformFeeMinor,
    ownerPayoutMinor,
  };
}

// Generate Paystack payment initialization data
export function generatePaystackPayload(
  email: string,
  amount: number, // in minor units (kobo)
  currency: string,
  reference: string,
  metadata: Record<string, any>
) {
  return {
    email,
    amount, // Paystack expects amount in kobo (NGN) or cents (USD)
    currency,
    reference,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
    metadata: {
      ...metadata,
      cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/operator/bookings/${metadata.bookingId}`,
    },
  };
}

// Generate Flutterwave payment initialization data
export function generateFlutterwavePayload(
  email: string,
  amount: number, // in major units (NGN/USD)
  currency: string,
  txRef: string,
  metadata: Record<string, any>
) {
  return {
    tx_ref: txRef,
    amount, // Flutterwave expects amount in major units
    currency,
    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
    customer: {
      email,
    },
    customizations: {
      title: "BlueFleet Escrow Payment",
      description: `Payment for booking ${metadata.bookingId}`,
      logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    },
    meta: metadata,
  };
}

// Verify webhook signature (Paystack)
export function verifyPaystackSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require("crypto");
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex");
  return hash === signature;
}

// Verify webhook signature (Flutterwave)
export function verifyFlutterwaveSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require("crypto");
  const secret = process.env.FLUTTERWAVE_SECRET_HASH || "";
  const hash = crypto.createHash("sha256").update(payload + secret).digest("hex");
  return hash === signature;
}

// Generate unique transaction reference
export function generateTransactionReference(bookingId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `BF-${bookingId.substring(0, 8)}-${timestamp}-${random}`.toUpperCase();
}

