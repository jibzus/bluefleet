"use client";

import { useState } from "react";
import { DocumentUpload } from "@/lib/validators/kyc";
import { Button } from "@/components/ui/button";

interface Step3Props {
  data: Partial<DocumentUpload>;
  onChange: (data: Partial<DocumentUpload>) => void;
  errors?: Record<string, string[]>;
}

export function Step3DocumentUpload({ data, onChange, errors }: Step3Props) {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = async (field: keyof DocumentUpload, file: File) => {
    setUploading(field);
    
    try {
      // TODO: Implement actual file upload to blob storage
      // For now, we'll simulate upload and store a placeholder URL
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockUrl = `https://storage.bluefleet.com/${field}/${file.name}`;
      onChange({ ...data, [field]: mockUrl });
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(null);
    }
  };

  const FileUploadField = ({
    label,
    field,
    required = false,
    description,
  }: {
    label: string;
    field: keyof DocumentUpload;
    required?: boolean;
    description?: string;
  }) => {
    const value = data[field] as string | undefined;
    const isUploading = uploading === field;

    return (
      <div className="rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {value && (
            <span className="text-xs text-green-600">✓ Uploaded</span>
          )}
        </div>
        
        {description && (
          <p className="mb-3 text-xs text-gray-500">{description}</p>
        )}

        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(field, file);
              }}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              className="pointer-events-none"
            >
              {isUploading ? "Uploading..." : value ? "Replace" : "Choose File"}
            </Button>
          </label>

          {value && (
            <span className="truncate text-xs text-gray-600">
              {value.split("/").pop()}
            </span>
          )}
        </div>

        {errors?.[field] && (
          <p className="mt-2 text-sm text-red-600">{errors[field]![0]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Document Upload</h2>
        <p className="mt-1 text-sm text-gray-600">
          Upload required documents for verification
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Accepted formats:</strong> PDF, JPG, PNG (max 5MB per file)
        </p>
      </div>

      <FileUploadField
        label="Identification Document"
        field="identificationDoc"
        required
        description="Government-issued ID (Passport, Driver's License, National ID)"
      />

      <FileUploadField
        label="Proof of Address"
        field="proofOfAddress"
        required
        description="Utility bill, bank statement (not older than 3 months)"
      />

      <FileUploadField
        label="Business Registration"
        field="businessRegistration"
        description="Certificate of Incorporation or Business Registration (for companies)"
      />

      <FileUploadField
        label="Tax Certificate"
        field="taxCertificate"
        description="Tax Identification Number certificate"
      />

      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="mb-2 text-sm font-medium text-gray-600">
          Additional Documents (Optional)
        </p>
        <p className="mb-4 text-xs text-gray-500">
          Upload any additional supporting documents
        </p>
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              // TODO: Handle multiple file uploads
              console.log("Additional files:", files);
            }}
            className="hidden"
          />
          <Button type="button" variant="outline">
            Choose Files
          </Button>
        </label>
      </div>

      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-xs text-yellow-900">
          <strong>Note:</strong> All documents will be securely stored and encrypted.
          Document hashes will be recorded for immutability and compliance.
        </p>
      </div>
    </div>
  );
}

