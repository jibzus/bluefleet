"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface KYCReviewActionsProps {
  kycId: string;
}

export function KYCReviewActions({ kycId }: KYCReviewActionsProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState("");

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this KYC application?")) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/kyc/${kycId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve");
      }

      alert("KYC application approved successfully!");
      router.refresh();
    } catch (error) {
      console.error("Approval error:", error);
      alert("Failed to approve KYC application");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    if (!confirm("Are you sure you want to reject this KYC application?")) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/kyc/${kycId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject");
      }

      alert("KYC application rejected");
      router.refresh();
    } catch (error) {
      console.error("Rejection error:", error);
      alert("Failed to reject KYC application");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Review Actions</h2>

      <div className="mb-4">
        <label htmlFor="notes" className="mb-2 block text-sm font-medium">
          Review Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this review (required for rejection)"
          className="h-24 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleApprove}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? "Processing..." : "✓ Approve"}
        </Button>
        <Button
          onClick={handleReject}
          disabled={isProcessing}
          variant="destructive"
        >
          {isProcessing ? "Processing..." : "✗ Reject"}
        </Button>
      </div>
    </Card>
  );
}

