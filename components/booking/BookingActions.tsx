"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BookingActionsProps {
  booking: any;
  userRole: "OPERATOR" | "OWNER";
}

export function BookingActions({ booking, userRole }: BookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking request?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel booking");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!confirm("Are you sure you want to accept this booking request?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ACCEPTED",
          note: "Booking accepted by owner",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to accept booking");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Please provide a reason for rejecting this booking:");
    if (!reason) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          note: `Rejected by owner: ${reason}`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject booking");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Actions</h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Operator Actions */}
        {userRole === "OPERATOR" && (
          <>
            {booking.status === "REQUESTED" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? "Cancelling..." : "Cancel Request"}
              </Button>
            )}
            {booking.status === "COUNTERED" && (
              <>
                <Button
                  className="w-full"
                  onClick={() => alert("Counter offer review coming soon")}
                  disabled={loading}
                >
                  Review Counter Offer
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Decline Counter Offer
                </Button>
              </>
            )}
            {booking.status === "ACCEPTED" && (
              <Button
                className="w-full"
                onClick={() => alert("Contract signing coming soon (WP-6)")}
                disabled={loading}
              >
                Proceed to Contract
              </Button>
            )}
          </>
        )}

        {/* Owner Actions */}
        {userRole === "OWNER" && (
          <>
            {booking.status === "REQUESTED" && (
              <>
                <Button
                  className="w-full"
                  onClick={handleAccept}
                  disabled={loading}
                >
                  {loading ? "Accepting..." : "Accept Booking"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => alert("Counter offer coming soon")}
                  disabled={loading}
                >
                  Make Counter Offer
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50"
                  onClick={handleReject}
                  disabled={loading}
                >
                  {loading ? "Rejecting..." : "Reject Booking"}
                </Button>
              </>
            )}
            {booking.status === "COUNTERED" && (
              <p className="text-sm text-gray-600">
                Waiting for operator response to counter offer
              </p>
            )}
            {booking.status === "ACCEPTED" && (
              <Button
                className="w-full"
                onClick={() => alert("Contract signing coming soon (WP-6)")}
                disabled={loading}
              >
                Proceed to Contract
              </Button>
            )}
          </>
        )}

        {booking.status === "CANCELLED" && (
          <p className="text-sm text-gray-600">This booking has been cancelled</p>
        )}
      </div>
    </Card>
  );
}

