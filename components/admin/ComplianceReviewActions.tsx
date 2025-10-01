"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ComplianceReviewActionsProps {
  complianceId: string;
  currentStatus: string;
}

export function ComplianceReviewActions({
  complianceId,
  currentStatus,
}: ComplianceReviewActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState<"verify" | "reject" | null>(null);

  const handleAction = async (action: "verify" | "reject") => {
    if (!notes.trim() && action === "reject") {
      alert("Please provide notes for rejection");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/compliance/${complianceId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() || undefined }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update compliance record");
      }

      router.refresh();
      setShowConfirm(null);
      setNotes("");
    } catch (error) {
      console.error("Error updating compliance:", error);
      alert(error instanceof Error ? error.message : "Failed to update compliance record");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="mb-4 font-semibold">Review Actions</h3>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Review Notes {showConfirm === "reject" && <span className="text-red-600">*</span>}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this compliance record..."
          className="w-full rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          rows={4}
          disabled={isLoading}
        />
      </div>

      {!showConfirm ? (
        <div className="space-y-3">
          <Button
            onClick={() => setShowConfirm("verify")}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            ✅ Verify Compliance
          </Button>
          <Button
            onClick={() => setShowConfirm("reject")}
            variant="destructive"
            className="w-full"
            disabled={isLoading}
          >
            ❌ Reject Compliance
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={`rounded-lg p-4 ${
              showConfirm === "verify"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <p className="mb-2 font-medium">
              {showConfirm === "verify"
                ? "Verify this compliance record?"
                : "Reject this compliance record?"}
            </p>
            <p className="text-sm text-gray-600">
              {showConfirm === "verify"
                ? "This will mark the compliance record as verified."
                : "This will mark the compliance record as rejected. Please provide a reason."}
            </p>
          </div>

          <Button
            onClick={() => handleAction(showConfirm)}
            className={
              showConfirm === "verify"
                ? "w-full bg-green-600 hover:bg-green-700"
                : "w-full"
            }
            variant={showConfirm === "verify" ? "default" : "destructive"}
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : showConfirm === "verify"
              ? "Confirm Verification"
              : "Confirm Rejection"}
          </Button>

          <Button
            onClick={() => setShowConfirm(null)}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> All actions are logged in the verification audit trail
          and cannot be undone. Please review carefully before confirming.
        </p>
      </div>
    </Card>
  );
}

