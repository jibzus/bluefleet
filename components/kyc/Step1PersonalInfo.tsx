"use client";

import { Input } from "@/components/ui/input";
import { PersonalInfo } from "@/lib/validators/kyc";

interface Step1Props {
  data: Partial<PersonalInfo>;
  onChange: (data: Partial<PersonalInfo>) => void;
  errors?: Record<string, string[]>;
}

export function Step1PersonalInfo({ data, onChange, errors }: Step1Props) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const isCompany = data.entityType === "COMPANY";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Personal/Company Information</h2>
        <p className="mt-1 text-sm text-gray-600">
          Please provide your basic information
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Entity Type</label>
        <div className="flex gap-4">
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-4 hover:bg-gray-50">
            <input
              type="radio"
              name="entityType"
              value="INDIVIDUAL"
              checked={data.entityType === "INDIVIDUAL"}
              onChange={(e) => handleChange("entityType", e.target.value as any)}
              className="h-4 w-4"
            />
            <div>
              <p className="font-medium">Individual</p>
              <p className="text-xs text-gray-500">Personal account</p>
            </div>
          </label>
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-4 hover:bg-gray-50">
            <input
              type="radio"
              name="entityType"
              value="COMPANY"
              checked={data.entityType === "COMPANY"}
              onChange={(e) => handleChange("entityType", e.target.value as any)}
              className="h-4 w-4"
            />
            <div>
              <p className="font-medium">Company</p>
              <p className="text-xs text-gray-500">Business account</p>
            </div>
          </label>
        </div>
        {errors?.entityType && (
          <p className="mt-1 text-sm text-red-600">{errors.entityType[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
          Full Name {!isCompany && <span className="text-red-500">*</span>}
        </label>
        <Input
          id="fullName"
          value={data.fullName || ""}
          onChange={(e) => handleChange("fullName", e.target.value)}
          placeholder="John Doe"
        />
        {errors?.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName[0]}</p>
        )}
      </div>

      {isCompany && (
        <>
          <div>
            <label htmlFor="companyName" className="mb-1 block text-sm font-medium">
              Company Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="companyName"
              value={data.companyName || ""}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="Acme Corporation"
            />
            {errors?.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="registrationNumber" className="mb-1 block text-sm font-medium">
              Registration Number
            </label>
            <Input
              id="registrationNumber"
              value={data.registrationNumber || ""}
              onChange={(e) => handleChange("registrationNumber", e.target.value)}
              placeholder="RC123456"
            />
            {errors?.registrationNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.registrationNumber[0]}</p>
            )}
          </div>
        </>
      )}

      {!isCompany && (
        <div>
          <label htmlFor="dateOfBirth" className="mb-1 block text-sm font-medium">
            Date of Birth
          </label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth || ""}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
          />
          {errors?.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth[0]}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="nationality" className="mb-1 block text-sm font-medium">
          Nationality <span className="text-red-500">*</span>
        </label>
        <Input
          id="nationality"
          value={data.nationality || ""}
          onChange={(e) => handleChange("nationality", e.target.value)}
          placeholder="Nigeria"
        />
        {errors?.nationality && (
          <p className="mt-1 text-sm text-red-600">{errors.nationality[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <Input
          id="phoneNumber"
          type="tel"
          value={data.phoneNumber || ""}
          onChange={(e) => handleChange("phoneNumber", e.target.value)}
          placeholder="+234 800 000 0000"
        />
        {errors?.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber[0]}</p>
        )}
      </div>
    </div>
  );
}

