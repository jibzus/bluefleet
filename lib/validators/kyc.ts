import { z } from "zod";

// Step 1: Personal/Company Information
export const personalInfoSchema = z.object({
  entityType: z.enum(["INDIVIDUAL", "COMPANY"], {
    required_error: "Please select entity type",
  }),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  companyName: z.string().optional(),
  registrationNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().min(2, "Nationality is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
});

// Step 2: Business Details
export const businessDetailsSchema = z.object({
  businessAddress: z.string().min(5, "Business address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  businessType: z.string().min(2, "Business type is required"),
  yearsInBusiness: z.number().min(0).optional(),
  taxId: z.string().optional(),
});

// Step 3: Document Upload
export const documentUploadSchema = z.object({
  identificationDoc: z.string().min(1, "Identification document is required"),
  proofOfAddress: z.string().min(1, "Proof of address is required"),
  businessRegistration: z.string().optional(),
  taxCertificate: z.string().optional(),
  additionalDocs: z.array(z.string()).optional(),
});

// Step 4: Verification
export const verificationSchema = z.object({
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  agreeToPrivacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy",
  }),
  certifyTruthfulness: z.boolean().refine((val) => val === true, {
    message: "You must certify that all information is truthful",
  }),
});

// Combined schema for all steps
export const kycFormSchema = z.object({
  personalInfo: personalInfoSchema,
  businessDetails: businessDetailsSchema,
  documents: documentUploadSchema,
  verification: verificationSchema,
});

// Type inference
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type BusinessDetails = z.infer<typeof businessDetailsSchema>;
export type DocumentUpload = z.infer<typeof documentUploadSchema>;
export type Verification = z.infer<typeof verificationSchema>;
export type KycFormData = z.infer<typeof kycFormSchema>;

// Helper to validate individual steps
export function validateStep(step: number, data: any) {
  switch (step) {
    case 1:
      return personalInfoSchema.safeParse(data);
    case 2:
      return businessDetailsSchema.safeParse(data);
    case 3:
      return documentUploadSchema.safeParse(data);
    case 4:
      return verificationSchema.safeParse(data);
    default:
      return { success: false, error: new Error("Invalid step") };
  }
}

