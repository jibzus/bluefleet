"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stepper, Step } from "@/components/kyc/Stepper";
import { Step1PersonalInfo } from "@/components/kyc/Step1PersonalInfo";
import { Step2BusinessDetails } from "@/components/kyc/Step2BusinessDetails";
import { Step3DocumentUpload } from "@/components/kyc/Step3DocumentUpload";
import { Step4Verification } from "@/components/kyc/Step4Verification";
import { Step5Review } from "@/components/kyc/Step5Review";
import {
  PersonalInfo,
  BusinessDetails,
  DocumentUpload,
  Verification,
  validateStep,
} from "@/lib/validators/kyc";

const steps: Step[] = [
  { id: 1, title: "Personal Info", description: "Basic information" },
  { id: 2, title: "Business", description: "Business details" },
  { id: 3, title: "Documents", description: "Upload files" },
  { id: 4, title: "Verification", description: "Terms & consent" },
  { id: 5, title: "Review", description: "Final review" },
];

export default function KYCPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    personalInfo: {} as Partial<PersonalInfo>,
    businessDetails: {} as Partial<BusinessDetails>,
    documents: {} as Partial<DocumentUpload>,
    verification: {} as Partial<Verification>,
  });

  // Auto-save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kyc-draft");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("kyc-draft", JSON.stringify(formData));
  }, [formData]);

  const handleNext = () => {
    // Validate current step
    let dataToValidate;
    switch (currentStep) {
      case 1:
        dataToValidate = formData.personalInfo;
        break;
      case 2:
        dataToValidate = formData.businessDetails;
        break;
      case 3:
        dataToValidate = formData.documents;
        break;
      case 4:
        dataToValidate = formData.verification;
        break;
      default:
        setCurrentStep(currentStep + 1);
        return;
    }

    const result = validateStep(currentStep, dataToValidate);

    if (!result.success && "flatten" in result.error) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      // Clear draft
      localStorage.removeItem("kyc-draft");

      // Redirect to success page
      router.push("/kyc/success");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit KYC application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">KYC/KYB Application</h1>
        <p className="mt-2 text-gray-600">
          Complete your Know Your Customer / Know Your Business verification
        </p>
      </div>

      <Stepper steps={steps} currentStep={currentStep} />

      <Card className="mt-8 p-8">
        {currentStep === 1 && (
          <Step1PersonalInfo
            data={formData.personalInfo}
            onChange={(data) =>
              setFormData({ ...formData, personalInfo: data })
            }
            errors={errors}
          />
        )}

        {currentStep === 2 && (
          <Step2BusinessDetails
            data={formData.businessDetails}
            onChange={(data) =>
              setFormData({ ...formData, businessDetails: data })
            }
            errors={errors}
          />
        )}

        {currentStep === 3 && (
          <Step3DocumentUpload
            data={formData.documents}
            onChange={(data) =>
              setFormData({ ...formData, documents: data })
            }
            errors={errors}
          />
        )}

        {currentStep === 4 && (
          <Step4Verification
            data={formData.verification}
            onChange={(data) =>
              setFormData({ ...formData, verification: data })
            }
            errors={errors}
          />
        )}

        {currentStep === 5 && <Step5Review data={formData} />}

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            Back
          </Button>

          {currentStep < 5 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>💾 Auto-save:</strong> Your progress is automatically saved. You can return to complete this form later.
        </p>
      </div>
    </main>
  );
}

