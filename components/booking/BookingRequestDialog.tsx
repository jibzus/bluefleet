"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { calculateBookingCost } from "@/lib/validators/booking";

interface BookingRequestDialogProps {
  vessel: {
    id: string;
    slug: string;
    specs: any;
    availability: Array<{ start: Date; end: Date }>;
  };
  pricing: {
    dailyRate: number;
    currency: string;
    minimumDays: number;
    securityDeposit: number;
  };
  trigger?: React.ReactNode;
}

export function BookingRequestDialog({
  vessel,
  pricing,
  trigger,
}: BookingRequestDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [customClauses, setCustomClauses] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [cargoType, setCargoType] = useState("");
  const [route, setRoute] = useState("");
  const [estimatedCrew, setEstimatedCrew] = useState("");

  // Calculate cost
  const cost = startDate && endDate
    ? calculateBookingCost(
        pricing.dailyRate,
        startDate,
        endDate,
        pricing.securityDeposit
      )
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate dates
      if (!startDate || !endDate) {
        throw new Error("Please select start and end dates");
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      if (start < now) {
        throw new Error("Start date must be in the future");
      }

      if (end <= start) {
        throw new Error("End date must be after start date");
      }

      if (cost && cost.days < pricing.minimumDays) {
        throw new Error(`Minimum booking period is ${pricing.minimumDays} days`);
      }

      // Submit booking request
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vesselId: vessel.id,
          start: startDate,
          end: endDate,
          terms: {
            purpose,
            customClauses,
            specialRequirements,
            cargoType,
            route,
            estimatedCrew: estimatedCrew ? parseInt(estimatedCrew) : undefined,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create booking request");
      }

      const booking = await response.json();

      // Close dialog and redirect to bookings page
      setOpen(false);
      router.push(`/operator/bookings/${booking.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="w-full">Request Booking</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request Booking</DialogTitle>
          <DialogDescription>
            Submit a booking request for {vessel.specs.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold">Booking Period</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  required
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Cost Summary */}
            {cost && pricing.dailyRate && (
              <Card className="bg-gray-50 p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{cost.days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Rate:</span>
                    <span className="font-medium">
                      {pricing.currency} {pricing.dailyRate?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {pricing.currency} {cost.subtotal?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  {cost.securityDeposit > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposit:</span>
                      <span className="font-medium">
                        {pricing.currency} {cost.securityDeposit?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 text-base">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-primary">
                      {pricing.currency} {cost.total?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Booking Details</h3>
            
            <div>
              <label className="mb-1 block text-sm font-medium">
                Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe the purpose of this charter (min 10 characters)"
                required
                minLength={10}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Cargo Type</label>
                <input
                  type="text"
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  placeholder="e.g., Crude oil, Containers"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Estimated Crew</label>
                <input
                  type="number"
                  value={estimatedCrew}
                  onChange={(e) => setEstimatedCrew(e.target.value)}
                  placeholder="Number of crew members"
                  min="0"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Route</label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="e.g., Lagos → Port Harcourt → Warri"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Special Requirements
              </label>
              <textarea
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="Any special requirements or requests"
                rows={2}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Custom Clauses
              </label>
              <textarea
                value={customClauses}
                onChange={(e) => setCustomClauses(e.target.value)}
                placeholder="Any custom terms or clauses for the contract"
                rows={2}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

