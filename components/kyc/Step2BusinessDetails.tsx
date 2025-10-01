"use client";

import { Input } from "@/components/ui/input";
import { BusinessDetails } from "@/lib/validators/kyc";

interface Step2Props {
  data: Partial<BusinessDetails>;
  onChange: (data: Partial<BusinessDetails>) => void;
  errors?: Record<string, string[]>;
}

export function Step2BusinessDetails({ data, onChange, errors }: Step2Props) {
  const handleChange = (field: keyof BusinessDetails, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Business Details</h2>
        <p className="mt-1 text-sm text-gray-600">
          Provide your business address and information
        </p>
      </div>

      <div>
        <label htmlFor="businessAddress" className="mb-1 block text-sm font-medium">
          Business Address <span className="text-red-500">*</span>
        </label>
        <Input
          id="businessAddress"
          value={data.businessAddress || ""}
          onChange={(e) => handleChange("businessAddress", e.target.value)}
          placeholder="123 Marina Street"
        />
        {errors?.businessAddress && (
          <p className="mt-1 text-sm text-red-600">{errors.businessAddress[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium">
            City <span className="text-red-500">*</span>
          </label>
          <Input
            id="city"
            value={data.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Lagos"
          />
          {errors?.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="mb-1 block text-sm font-medium">
            State/Province <span className="text-red-500">*</span>
          </label>
          <Input
            id="state"
            value={data.state || ""}
            onChange={(e) => handleChange("state", e.target.value)}
            placeholder="Lagos State"
          />
          {errors?.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="country" className="mb-1 block text-sm font-medium">
            Country <span className="text-red-500">*</span>
          </label>
          <Input
            id="country"
            value={data.country || ""}
            onChange={(e) => handleChange("country", e.target.value)}
            placeholder="Nigeria"
          />
          {errors?.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="postalCode" className="mb-1 block text-sm font-medium">
            Postal Code <span className="text-red-500">*</span>
          </label>
          <Input
            id="postalCode"
            value={data.postalCode || ""}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            placeholder="100001"
          />
          {errors?.postalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.postalCode[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="businessType" className="mb-1 block text-sm font-medium">
          Business Type <span className="text-red-500">*</span>
        </label>
        <select
          id="businessType"
          value={data.businessType || ""}
          onChange={(e) => handleChange("businessType", e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select business type</option>
          <option value="SHIPPING">Shipping Company</option>
          <option value="LOGISTICS">Logistics Provider</option>
          <option value="VESSEL_OWNER">Vessel Owner</option>
          <option value="CHARTER">Charter Company</option>
          <option value="FREIGHT">Freight Forwarder</option>
          <option value="OTHER">Other</option>
        </select>
        {errors?.businessType && (
          <p className="mt-1 text-sm text-red-600">{errors.businessType[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="yearsInBusiness" className="mb-1 block text-sm font-medium">
            Years in Business
          </label>
          <Input
            id="yearsInBusiness"
            type="number"
            min="0"
            value={data.yearsInBusiness || ""}
            onChange={(e) => handleChange("yearsInBusiness", parseInt(e.target.value) || 0)}
            placeholder="5"
          />
          {errors?.yearsInBusiness && (
            <p className="mt-1 text-sm text-red-600">{errors.yearsInBusiness[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="taxId" className="mb-1 block text-sm font-medium">
            Tax ID / TIN
          </label>
          <Input
            id="taxId"
            value={data.taxId || ""}
            onChange={(e) => handleChange("taxId", e.target.value)}
            placeholder="12345678-0001"
          />
          {errors?.taxId && (
            <p className="mt-1 text-sm text-red-600">{errors.taxId[0]}</p>
          )}
        </div>
      </div>
    </div>
  );
}

