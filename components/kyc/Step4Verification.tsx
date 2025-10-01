"use client";

import { Verification } from "@/lib/validators/kyc";

interface Step4Props {
  data: Partial<Verification>;
  onChange: (data: Partial<Verification>) => void;
  errors?: Record<string, string[]>;
}

export function Step4Verification({ data, onChange, errors }: Step4Props) {
  const handleChange = (field: keyof Verification, value: boolean) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Verification & Consent</h2>
        <p className="mt-1 text-sm text-gray-600">
          Please review and accept the following terms
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={data.agreeToTerms || false}
              onChange={(e) => handleChange("agreeToTerms", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <div className="flex-1">
              <p className="font-medium">Terms and Conditions</p>
              <p className="mt-1 text-sm text-gray-600">
                I have read and agree to the{" "}
                <a href="/terms" target="_blank" className="text-primary underline">
                  Terms and Conditions
                </a>{" "}
                of BlueFleet platform.
              </p>
            </div>
          </label>
          {errors?.agreeToTerms && (
            <p className="mt-2 text-sm text-red-600">{errors.agreeToTerms[0]}</p>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={data.agreeToPrivacy || false}
              onChange={(e) => handleChange("agreeToPrivacy", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <div className="flex-1">
              <p className="font-medium">Privacy Policy</p>
              <p className="mt-1 text-sm text-gray-600">
                I acknowledge that I have read and understood the{" "}
                <a href="/privacy" target="_blank" className="text-primary underline">
                  Privacy Policy
                </a>{" "}
                and consent to the collection and processing of my personal data in accordance with NDPR/GDPR.
              </p>
            </div>
          </label>
          {errors?.agreeToPrivacy && (
            <p className="mt-2 text-sm text-red-600">{errors.agreeToPrivacy[0]}</p>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={data.certifyTruthfulness || false}
              onChange={(e) => handleChange("certifyTruthfulness", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <div className="flex-1">
              <p className="font-medium">Certification of Truthfulness</p>
              <p className="mt-1 text-sm text-gray-600">
                I certify that all information provided in this KYC/KYB submission is true, accurate, and complete to the best of my knowledge. I understand that providing false information may result in account suspension or legal action.
              </p>
            </div>
          </label>
          {errors?.certifyTruthfulness && (
            <p className="mt-2 text-sm text-red-600">{errors.certifyTruthfulness[0]}</p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-900">Data Protection Notice</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Your data will be encrypted and stored securely</li>
          <li>• Document hashes will be recorded for immutability</li>
          <li>• Access is restricted to authorized personnel only</li>
          <li>• You have the right to request data export or deletion</li>
          <li>• Compliance data will be retained for 5 years as per regulations</li>
        </ul>
      </div>

      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">
          <strong>Next Step:</strong> After submitting, your application will be reviewed by our compliance team. You will receive an email notification once the review is complete (typically within 2-3 business days).
        </p>
      </div>
    </div>
  );
}

