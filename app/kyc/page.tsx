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
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-24">
      <header className="fade-in rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card px-6 py-10 shadow-sm">
        <h1 className="text-4xl font-bold text-foreground">KYC/KYB Application</h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Complete your Know Your Customer / Know Your Business verification to unlock secure escrow,
          compliance monitoring, and full marketplace access.
        </p>
      </header>

      <Card className="slide-up rounded-3xl border border-border bg-card p-6 shadow-sm">
        <Stepper steps={steps} currentStep={currentStep} />
      </Card>

      <Card className="slide-up rounded-3xl border border-border bg-card p-8 shadow-sm">
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

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            Back
          </Button>

          {currentStep < 5 ? (
            <Button size="lg" onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button size="lg" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </Card>

      <div className="slide-up rounded-3xl border border-dashed border-primary/40 bg-primary/5 px-6 py-5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 text-sm text-primary">
          <span className="text-base">💾</span>
          <span className="font-semibold text-foreground">Auto-save enabled</span>
        </p>
        <p className="mt-2">
          Your progress is stored locally every time you update a section. Feel free to pause and return when ready.
        </p>
      </div>
    </main>
  );
}
