"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AvailabilityTabProps {
  data: any[];
  onChange: (availability: any[]) => void;
}

export function AvailabilityTab({ data, onChange }: AvailabilityTabProps) {
  const [slots, setSlots] = useState(data || []);
  const [newSlot, setNewSlot] = useState({
    start: "",
    end: "",
  });

  const handleAddSlot = () => {
    if (!newSlot.start || !newSlot.end) {
      alert("Please select both start and end dates");
      return;
    }

    const start = new Date(newSlot.start);
    const end = new Date(newSlot.end);

    if (end <= start) {
      alert("End date must be after start date");
      return;
    }

    const newSlots = [...slots, { ...newSlot }];
    setSlots(newSlots);
    onChange(newSlots);
    setNewSlot({ start: "", end: "" });
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = slots.filter((_, i) => i !== index);
    setSlots(newSlots);
    onChange(newSlots);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-semibold">Availability Calendar</h2>
        <p className="mb-4 text-sm text-gray-600">
          Define when your vessel is available for booking
        </p>

        {/* Add Availability Slot */}
        <div className="mb-6 rounded-lg border p-4">
          <h3 className="mb-3 font-medium">Add Availability Period</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-600">*</span>
              </label>
              <Input
                type="date"
                value={newSlot.start}
                onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                End Date <span className="text-red-600">*</span>
              </label>
              <Input
                type="date"
                value={newSlot.end}
                onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                min={newSlot.start || new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <Button onClick={handleAddSlot} className="mt-4">
            Add Period
          </Button>
        </div>

        {/* Availability List */}
        {slots.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
            <div className="mb-2 text-4xl">📅</div>
            <p className="text-gray-600">No availability periods defined</p>
            <p className="mt-1 text-sm text-gray-500">
              Add periods when your vessel is available for booking
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, index) => {
              const start = new Date(slot.start);
              const end = new Date(slot.end);
              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {start.toLocaleDateString()} → {end.toLocaleDateString()}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{days} days</p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveSlot(index)}
                      className="text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-medium text-blue-900">Quick Add</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const today = new Date();
                const nextMonth = new Date(today);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setNewSlot({
                  start: today.toISOString().split("T")[0],
                  end: nextMonth.toISOString().split("T")[0],
                });
              }}
              className="text-xs"
            >
              Next 30 Days
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const today = new Date();
                const nextQuarter = new Date(today);
                nextQuarter.setMonth(nextQuarter.getMonth() + 3);
                setNewSlot({
                  start: today.toISOString().split("T")[0],
                  end: nextQuarter.toISOString().split("T")[0],
                });
              }}
              className="text-xs"
            >
              Next 90 Days
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

