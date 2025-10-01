import { z } from "zod";

// Booking Request Schema
export const bookingRequestSchema = z.object({
  vesselId: z.string().min(1, "Vessel ID is required"),
  start: z.string().or(z.date()),
  end: z.string().or(z.date()),
  terms: z.object({
    purpose: z.string().min(10, "Please describe the purpose (min 10 characters)"),
    customClauses: z.string().optional(),
    specialRequirements: z.string().optional(),
    estimatedCrew: z.number().min(0).optional(),
    cargoType: z.string().optional(),
    route: z.string().optional(),
  }),
}).refine((data) => {
  const start = new Date(data.start);
  const end = new Date(data.end);
  const now = new Date();
  
  // Start date must be in the future
  if (start < now) {
    return false;
  }
  
  // End date must be after start date
  if (end <= start) {
    return false;
  }
  
  return true;
}, {
  message: "Invalid date range: start must be in the future and end must be after start",
  path: ["start"],
});

// Counter Offer Schema
export const counterOfferSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  start: z.string().or(z.date()).optional(),
  end: z.string().or(z.date()).optional(),
  terms: z.object({
    purpose: z.string().optional(),
    customClauses: z.string().optional(),
    specialRequirements: z.string().optional(),
    estimatedCrew: z.number().min(0).optional(),
    cargoType: z.string().optional(),
    route: z.string().optional(),
    counterNote: z.string().min(10, "Please explain the counter offer (min 10 characters)"),
  }),
  pricing: z.object({
    dailyRate: z.number().min(1).optional(),
    currency: z.enum(["USD", "EUR", "GBP", "NGN"]).optional(),
    securityDeposit: z.number().min(0).optional(),
  }).optional(),
});

// Booking Status Update Schema
export const bookingStatusUpdateSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  status: z.enum(["REQUESTED", "COUNTERED", "ACCEPTED", "CANCELLED"]),
  note: z.string().optional(),
});

// Booking Filter Schema
export const bookingFilterSchema = z.object({
  status: z.enum(["REQUESTED", "COUNTERED", "ACCEPTED", "CANCELLED"]).optional(),
  vesselId: z.string().optional(),
  operatorId: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
});

// Calculate booking duration in days
export function calculateBookingDays(start: Date | string, end: Date | string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Calculate total booking cost
export function calculateBookingCost(
  dailyRate: number,
  start: Date | string,
  end: Date | string,
  securityDeposit: number = 0
): {
  days: number;
  subtotal: number;
  securityDeposit: number;
  total: number;
} {
  const days = calculateBookingDays(start, end);
  const subtotal = dailyRate * days;
  const total = subtotal + securityDeposit;
  
  return {
    days,
    subtotal,
    securityDeposit,
    total,
  };
}

// Check if dates overlap with existing bookings
export function checkDateOverlap(
  newStart: Date | string,
  newEnd: Date | string,
  existingStart: Date | string,
  existingEnd: Date | string
): boolean {
  const ns = new Date(newStart);
  const ne = new Date(newEnd);
  const es = new Date(existingStart);
  const ee = new Date(existingEnd);
  
  return ns < ee && ne > es;
}

// Validate booking against vessel availability
export function validateBookingAvailability(
  requestStart: Date | string,
  requestEnd: Date | string,
  availabilitySlots: Array<{ start: Date | string; end: Date | string }>
): boolean {
  const rs = new Date(requestStart);
  const re = new Date(requestEnd);
  
  // Check if the requested period falls within any availability slot
  return availabilitySlots.some((slot) => {
    const ss = new Date(slot.start);
    const se = new Date(slot.end);
    return rs >= ss && re <= se;
  });
}

// Format booking status for display
export function formatBookingStatus(status: string): {
  label: string;
  color: string;
  description: string;
} {
  switch (status) {
    case "REQUESTED":
      return {
        label: "Requested",
        color: "blue",
        description: "Awaiting owner response",
      };
    case "COUNTERED":
      return {
        label: "Countered",
        color: "yellow",
        description: "Owner proposed changes",
      };
    case "ACCEPTED":
      return {
        label: "Accepted",
        color: "green",
        description: "Booking confirmed",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        color: "red",
        description: "Booking cancelled",
      };
    default:
      return {
        label: status,
        color: "gray",
        description: "Unknown status",
      };
  }
}

