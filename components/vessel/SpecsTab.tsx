"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface SpecsTabProps {
  data: any;
  emissions: any;
  onChange: (specs: any, emissions: any) => void;
}

export function SpecsTab({ data, emissions, onChange }: SpecsTabProps) {
  const [specs, setSpecs] = useState(data || {});
  const [emissionsData, setEmissionsData] = useState(emissions || {});

  useEffect(() => {
    onChange(specs, emissionsData);
  }, [specs, emissionsData]);

  const handleSpecChange = (field: string, value: any) => {
    setSpecs((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEmissionChange = (field: string, value: any) => {
    setEmissionsData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-semibold">Vessel Specifications</h2>
        
        {/* Basic Info */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Vessel Name <span className="text-red-600">*</span>
            </label>
            <Input
              value={specs.name || ""}
              onChange={(e) => handleSpecChange("name", e.target.value)}
              placeholder="e.g., MV Atlantic Star"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Vessel Type <span className="text-red-600">*</span>
            </label>
            <select
              value={specs.type || ""}
              onChange={(e) => handleSpecChange("type", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              required
            >
              <option value="">Select type...</option>
              <option value="Cargo">Cargo</option>
              <option value="Tanker">Tanker</option>
              <option value="Container">Container</option>
              <option value="Bulk Carrier">Bulk Carrier</option>
              <option value="Tug">Tug</option>
              <option value="Supply">Supply</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Dimensions */}
        <div className="mb-6">
          <h3 className="mb-3 font-medium">Dimensions</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Length (m) <span className="text-red-600">*</span>
              </label>
              <Input
                type="number"
                value={specs.length || ""}
                onChange={(e) => handleSpecChange("length", parseFloat(e.target.value))}
                placeholder="150"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Beam (m) <span className="text-red-600">*</span>
              </label>
              <Input
                type="number"
                value={specs.beam || ""}
                onChange={(e) => handleSpecChange("beam", parseFloat(e.target.value))}
                placeholder="25"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Draft (m) <span className="text-red-600">*</span>
              </label>
              <Input
                type="number"
                value={specs.draft || ""}
                onChange={(e) => handleSpecChange("draft", parseFloat(e.target.value))}
                placeholder="8"
                required
              />
            </div>
          </div>
        </div>

        {/* Tonnage */}
        <div className="mb-6">
          <h3 className="mb-3 font-medium">Tonnage</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Gross Tonnage <span className="text-red-600">*</span>
              </label>
              <Input
                type="number"
                value={specs.grossTonnage || ""}
                onChange={(e) => handleSpecChange("grossTonnage", parseFloat(e.target.value))}
                placeholder="5000"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Deadweight (tons) <span className="text-red-600">*</span>
              </label>
              <Input
                type="number"
                value={specs.deadweight || ""}
                onChange={(e) => handleSpecChange("deadweight", parseFloat(e.target.value))}
                placeholder="7500"
                required
              />
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className="mb-6">
          <h3 className="mb-3 font-medium">Registration</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Year Built <span className="text-red-600">*</span>
              </label>
              <Input
                type="number"
                value={specs.yearBuilt || ""}
                onChange={(e) => handleSpecChange("yearBuilt", parseInt(e.target.value))}
                placeholder="2015"
                min="1900"
                max={new Date().getFullYear()}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Flag State <span className="text-red-600">*</span>
              </label>
              <Input
                value={specs.flag || ""}
                onChange={(e) => handleSpecChange("flag", e.target.value)}
                placeholder="Nigeria"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                IMO Number
              </label>
              <Input
                value={specs.imoNumber || ""}
                onChange={(e) => handleSpecChange("imoNumber", e.target.value)}
                placeholder="IMO 1234567"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Call Sign
              </label>
              <Input
                value={specs.callSign || ""}
                onChange={(e) => handleSpecChange("callSign", e.target.value)}
                placeholder="5NAB"
              />
            </div>
          </div>
        </div>

        {/* Home Port */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Home Port <span className="text-red-600">*</span>
          </label>
          <Input
            value={specs.homePort || ""}
            onChange={(e) => handleSpecChange("homePort", e.target.value)}
            placeholder="Lagos, Nigeria"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description <span className="text-red-600">*</span>
          </label>
          <textarea
            value={specs.description || ""}
            onChange={(e) => handleSpecChange("description", e.target.value)}
            placeholder="Describe your vessel, its capabilities, and any special features..."
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
            rows={4}
            required
          />
        </div>
      </div>

      {/* Emissions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Emissions Profile</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              CO₂ per Nautical Mile (kg)
            </label>
            <Input
              type="number"
              value={emissionsData.co2PerNm || ""}
              onChange={(e) => handleEmissionChange("co2PerNm", parseFloat(e.target.value))}
              placeholder="12.5"
              step="0.1"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              EEDI Rating
            </label>
            <Input
              value={emissionsData.eediRating || ""}
              onChange={(e) => handleEmissionChange("eediRating", e.target.value)}
              placeholder="A"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emissionsData.noxCompliant || false}
              onChange={(e) => handleEmissionChange("noxCompliant", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              NOx Compliant (Tier III)
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emissionsData.soxCompliant || false}
              onChange={(e) => handleEmissionChange("soxCompliant", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              SOx Compliant (IMO 2020)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

