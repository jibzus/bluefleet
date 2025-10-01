"use client";

import { KycFormData, PersonalInfo, BusinessDetails, DocumentUpload, Verification } from "@/lib/validators/kyc";
import { Card } from "@/components/ui/card";

interface Step5Props {
  data: {
    personalInfo: Partial<PersonalInfo>;
    businessDetails: Partial<BusinessDetails>;
    documents: Partial<DocumentUpload>;
    verification: Partial<Verification>;
  };
}

export function Step5Review({ data }: Step5Props) {
  const { personalInfo, businessDetails, documents, verification } = data;

  const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between border-b py-2 last:border-0">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm text-gray-900">{value || "Not provided"}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review Your Information</h2>
        <p className="mt-1 text-sm text-gray-600">
          Please review all information before submitting
        </p>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Personal/Company Information</h3>
        <div className="space-y-1">
          <InfoRow label="Entity Type" value={personalInfo?.entityType} />
          <InfoRow label="Full Name" value={personalInfo?.fullName} />
          {personalInfo?.entityType === "COMPANY" && (
            <>
              <InfoRow label="Company Name" value={personalInfo?.companyName} />
              <InfoRow label="Registration Number" value={personalInfo?.registrationNumber} />
            </>
          )}
          {personalInfo?.entityType === "INDIVIDUAL" && (
            <InfoRow label="Date of Birth" value={personalInfo?.dateOfBirth} />
          )}
          <InfoRow label="Nationality" value={personalInfo?.nationality} />
          <InfoRow label="Phone Number" value={personalInfo?.phoneNumber} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Business Details</h3>
        <div className="space-y-1">
          <InfoRow label="Business Address" value={businessDetails?.businessAddress} />
          <InfoRow label="City" value={businessDetails?.city} />
          <InfoRow label="State" value={businessDetails?.state} />
          <InfoRow label="Country" value={businessDetails?.country} />
          <InfoRow label="Postal Code" value={businessDetails?.postalCode} />
          <InfoRow label="Business Type" value={businessDetails?.businessType} />
          <InfoRow label="Years in Business" value={businessDetails?.yearsInBusiness} />
          <InfoRow label="Tax ID" value={businessDetails?.taxId} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Uploaded Documents</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm font-medium">Identification Document</span>
            </div>
            {documents?.identificationDoc && (
              <span className="text-xs text-gray-500">Uploaded</span>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm font-medium">Proof of Address</span>
            </div>
            {documents?.proofOfAddress && (
              <span className="text-xs text-gray-500">Uploaded</span>
            )}
          </div>

          {documents?.businessRegistration && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-sm font-medium">Business Registration</span>
              </div>
              <span className="text-xs text-gray-500">Uploaded</span>
            </div>
          )}

          {documents?.taxCertificate && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-sm font-medium">Tax Certificate</span>
              </div>
              <span className="text-xs text-gray-500">Uploaded</span>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Verification & Consent</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className={`h-5 w-5 ${verification?.agreeToTerms ? 'text-green-500' : 'text-gray-300'}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm">Agreed to Terms and Conditions</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className={`h-5 w-5 ${verification?.agreeToPrivacy ? 'text-green-500' : 'text-gray-300'}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm">Agreed to Privacy Policy</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className={`h-5 w-5 ${verification?.certifyTruthfulness ? 'text-green-500' : 'text-gray-300'}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm">Certified information truthfulness</span>
          </div>
        </div>
      </Card>

      <div className="rounded-lg bg-green-50 p-4">
        <p className="text-sm text-green-900">
          <strong>Ready to submit!</strong> Once you click "Submit Application", your KYC/KYB information will be sent for review. You'll receive an email notification when the review is complete.
        </p>
      </div>
    </div>
  );
}

