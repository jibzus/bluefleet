"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrackingMap } from "./TrackingMap";
import {
  formatTrackingEvent,
  calculateRouteDistance,
  getVesselStatus,
} from "@/lib/validators/tracking";

interface TrackingEvent {
  id: string;
  vesselId: string;
  bookingId: string | null;
  lat: number;
  lng: number;
  ts: string;
  provider: string;
  meta: any;
}

interface TrackingDashboardProps {
  vesselId: string;
  bookingId?: string;
  vesselName: string;
}

export function TrackingDashboard({
  vesselId,
  bookingId,
  vesselName,
}: TrackingDashboardProps) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchTrackingData = async () => {
    try {
      const params = new URLSearchParams({ vesselId });
      if (bookingId) params.append("bookingId", bookingId);

      const response = await fetch(`/api/tracking?${params}`);
      if (!response.ok) throw new Error("Failed to fetch tracking data");

      const data = await response.json();
      setEvents(data.events || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();

    // Auto-refresh every 60 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchTrackingData, 60000);
      return () => clearInterval(interval);
    }
  }, [vesselId, bookingId, autoRefresh]);

  if (loading) {
    return (
      <Card className="p-8">
        <p className="text-center text-gray-500">Loading tracking data...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <p className="text-center text-red-500">Error: {error}</p>
        <Button onClick={fetchTrackingData} className="mt-4 mx-auto block">
          Retry
        </Button>
      </Card>
    );
  }

  const latestEvent = events[0];
  const vesselStatus = getVesselStatus(latestEvent);
  const totalDistance = calculateRouteDistance(events);

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800",
    STALE: "bg-yellow-100 text-yellow-800",
    OFFLINE: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{vesselName}</h2>
            <p className="text-sm text-gray-600">Real-time Tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[vesselStatus]}`}
            >
              {vesselStatus}
            </span>
            <Button
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "⏸ Pause" : "▶ Resume"} Auto-refresh
            </Button>
            <Button variant="outline" onClick={fetchTrackingData}>
              🔄 Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {latestEvent && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Last Update</p>
            <p className="text-lg font-semibold">
              {new Date(latestEvent.ts).toLocaleTimeString()}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(latestEvent.ts).toLocaleDateString()}
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600">Current Position</p>
            <p className="text-lg font-semibold">
              {latestEvent.lat.toFixed(4)}°, {latestEvent.lng.toFixed(4)}°
            </p>
            <p className="text-xs text-gray-500">
              {latestEvent.lat >= 0 ? "N" : "S"},{" "}
              {latestEvent.lng >= 0 ? "E" : "W"}
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600">Speed</p>
            <p className="text-lg font-semibold">
              {latestEvent.meta?.speed || "N/A"}
              {latestEvent.meta?.speed && " knots"}
            </p>
            <p className="text-xs text-gray-500">
              Course: {latestEvent.meta?.course || "N/A"}°
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Distance</p>
            <p className="text-lg font-semibold">
              {totalDistance.toFixed(1)} km
            </p>
            <p className="text-xs text-gray-500">
              {events.length} position updates
            </p>
          </Card>
        </div>
      )}

      {/* Map */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Route Map</h3>
        <TrackingMap events={events} height="500px" showRoute={true} />
      </Card>

      {/* Event History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Position History</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.map((event, index) => {
            const formatted = formatTrackingEvent(event);
            return (
              <div
                key={event.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <p className="font-medium">
                    {index === 0 ? "🔴 Current" : `📍 Position ${events.length - index}`}
                  </p>
                  <p className="text-sm text-gray-600">{formatted.position}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatted.timestamp}</p>
                  <p className="text-xs text-gray-500">
                    {formatted.speed && `${formatted.speed} • `}
                    {formatted.provider}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

