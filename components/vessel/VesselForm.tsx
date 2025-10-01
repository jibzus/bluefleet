"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpecsTab } from "./SpecsTab";
import { MediaTab } from "./MediaTab";
import { ComplianceTab } from "./ComplianceTab";
import { PricingTab } from "./PricingTab";
import { AvailabilityTab } from "./AvailabilityTab";

interface VesselFormProps {
  userId: string;
  vessel?: any; // Existing vessel for edit mode
}

type Tab = "specs" | "emissions" | "media" | "compliance" | "certifications" | "pricing" | "availability";

export function VesselForm({ userId, vessel }: VesselFormProps) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<Tab>("specs");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    specs: vessel?.specs || {},
    emissions: vessel?.emissions || {},
    pricing: {},
    media: vessel?.media || [],
    certifications: vessel?.certs || [],
    availability: vessel?.availability || [],
    status: vessel?.status || "DRAFT",
  });

  // Auto-save to localStorage
  useEffect(() => {
    if (!vessel) {
      const saved = localStorage.getItem("vessel-draft");
      if (saved) {
        try {
          setFormData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load draft:", e);
        }
      }
    }
  }, [vessel]);

  useEffect(() => {
    if (!vessel) {
      localStorage.setItem("vessel-draft", JSON.stringify(formData));
    }
  }, [formData, vessel]);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "specs", label: "Specifications", icon: "📋" },
    { id: "media", label: "Media", icon: "📸" },
    { id: "compliance", label: "Compliance", icon: "✅" },
    { id: "pricing", label: "Pricing", icon: "💰" },
    { id: "availability", label: "Availability", icon: "📅" },
  ];

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab);
  };

  const handleDataChange = (tab: Tab, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: data,
    }));
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        vessel ? `/api/vessels/${vessel.id}` : "/api/vessels",
        {
          method: vessel ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            status: "DRAFT",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save draft");
      }

      const result = await response.json();
      
      // Clear localStorage draft
      if (!vessel) {
        localStorage.removeItem("vessel-draft");
      }

      // Redirect to edit page if creating new
      if (!vessel) {
        router.push(`/owner/vessels/${result.vessel.id}`);
      } else {
        router.refresh();
      }

      alert("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert(error instanceof Error ? error.message : "Failed to save draft");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    // Validate all required fields
    const specs = formData.specs as any;
    if (!specs.name || !specs.type || !specs.homePort) {
      alert("Please complete all required specifications");
      setCurrentTab("specs");
      return;
    }

    if (!formData.media || formData.media.length === 0) {
      alert("Please add at least one image");
      setCurrentTab("media");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        vessel ? `/api/vessels/${vessel.id}` : "/api/vessels",
        {
          method: vessel ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            status: "ACTIVE",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to publish vessel");
      }

      // Clear localStorage draft
      if (!vessel) {
        localStorage.removeItem("vessel-draft");
      }

      router.push("/owner/vessels");
      alert("Vessel published successfully!");
    } catch (error) {
      console.error("Error publishing vessel:", error);
      alert(error instanceof Error ? error.message : "Failed to publish vessel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <Card className="mb-6 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                currentTab === tab.id
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      <Card className="mb-6 p-6">
        {currentTab === "specs" && (
          <SpecsTab
            data={formData.specs}
            emissions={formData.emissions}
            onChange={(specs, emissions) => {
              handleDataChange("specs", specs);
              handleDataChange("emissions", emissions);
            }}
          />
        )}
        {currentTab === "media" && (
          <MediaTab
            data={formData.media}
            onChange={(media) => handleDataChange("media", media)}
          />
        )}
        {currentTab === "compliance" && (
          <ComplianceTab
            data={formData.certifications}
            onChange={(certs) => handleDataChange("certifications", certs)}
          />
        )}
        {currentTab === "pricing" && (
          <PricingTab
            data={formData.pricing}
            onChange={(pricing) => handleDataChange("pricing", pricing)}
          />
        )}
        {currentTab === "availability" && (
          <AvailabilityTab
            data={formData.availability}
            onChange={(availability) => handleDataChange("availability", availability)}
          />
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/owner/vessels")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Publishing..." : "Publish Vessel"}
          </Button>
        </div>
      </div>
    </div>
  );
}

