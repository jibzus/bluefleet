import { z } from "zod";

// Vessel Specs Schema
export const vesselSpecsSchema = z.object({
  name: z.string().min(2, "Vessel name must be at least 2 characters"),
  type: z.enum(
    ["Cargo", "Tanker", "Container", "Bulk Carrier", "Tug", "Supply", "Other"],
    {
      required_error: "Please select a vessel type",
    }
  ),
  length: z.number().min(1, "Length is required").max(500, "Length must be less than 500m"),
  beam: z.number().min(1, "Beam is required").max(100, "Beam must be less than 100m"),
  draft: z.number().min(0.1, "Draft is required").max(50, "Draft must be less than 50m"),
  grossTonnage: z.number().min(1, "Gross tonnage is required"),
  deadweight: z.number().min(1, "Deadweight is required"),
  yearBuilt: z.number().min(1900, "Year built must be after 1900").max(new Date().getFullYear(), "Year built cannot be in the future"),
  flag: z.string().min(2, "Flag state is required"),
  imoNumber: z.string().optional(),
  callSign: z.string().optional(),
  homePort: z.string().min(2, "Home port is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
});

// Emissions Schema
export const emissionsSchema = z.object({
  co2PerNm: z.number().min(0, "CO2 per nautical mile must be positive"),
  noxCompliant: z.boolean().default(false),
  soxCompliant: z.boolean().default(false),
  eediRating: z.string().optional(),
});

// Pricing Schema
export const pricingSchema = z.object({
  dailyRate: z.number().min(1, "Daily rate is required"),
  currency: z.enum(["USD", "EUR", "GBP", "NGN"], {
    required_error: "Please select a currency",
  }),
  minimumDays: z.number().min(1, "Minimum days must be at least 1").default(1),
  securityDeposit: z.number().min(0, "Security deposit must be positive").default(0),
  fuelIncluded: z.boolean().default(false),
  crewIncluded: z.boolean().default(false),
});

// Availability Slot Schema
export const availabilitySlotSchema = z.object({
  start: z.string().or(z.date()),
  end: z.string().or(z.date()),
}).refine((data) => {
  const start = new Date(data.start);
  const end = new Date(data.end);
  return end > start;
}, {
  message: "End date must be after start date",
});

// Certification Schema
export const certificationSchema = z.object({
  kind: z.string().min(2, "Certification type is required"),
  issuer: z.string().optional(),
  number: z.string().optional(),
  issuedAt: z.string().or(z.date()).optional(),
  expiresAt: z.string().or(z.date()).optional(),
  docUrl: z.string().url("Invalid document URL").optional(),
});

// Media Schema
export const mediaSchema = z.object({
  url: z.string().url("Invalid image URL"),
  alt: z.string().optional(),
  sort: z.number().default(0),
});

// Complete Vessel Form Schema
export const vesselFormSchema = z.object({
  specs: vesselSpecsSchema,
  emissions: emissionsSchema,
  pricing: pricingSchema,
  media: z.array(mediaSchema).min(1, "At least one image is required"),
  certifications: z.array(certificationSchema).optional(),
  availability: z.array(availabilitySlotSchema).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).default("DRAFT"),
});

// Type inference
export type VesselSpecs = z.infer<typeof vesselSpecsSchema>;
export type Emissions = z.infer<typeof emissionsSchema>;
export type Pricing = z.infer<typeof pricingSchema>;
export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type MediaInput = z.infer<typeof mediaSchema>;
export type VesselFormData = z.infer<typeof vesselFormSchema>;

// Helper to validate individual tabs
export function validateVesselTab(tab: string, data: any) {
  switch (tab) {
    case "specs":
      return vesselSpecsSchema.safeParse(data);
    case "emissions":
      return emissionsSchema.safeParse(data);
    case "pricing":
      return pricingSchema.safeParse(data);
    case "media":
      return z.array(mediaSchema).min(1).safeParse(data);
    case "certifications":
      return z.array(certificationSchema).safeParse(data);
    case "availability":
      return z.array(availabilitySlotSchema).safeParse(data);
    default:
      return { success: false, error: new Error("Invalid tab") };
  }
}

// Generate slug from vessel name
export function generateVesselSlug(name: string, imoNumber?: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  
  if (imoNumber) {
    return `${baseSlug}-${imoNumber}`;
  }
  
  // Add random suffix if no IMO number
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${suffix}`;
}

