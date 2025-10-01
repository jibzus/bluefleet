"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

interface TrackingEvent {
  id: string;
  lat: number;
  lng: number;
  ts: string;
  provider: string;
  meta: any;
}

interface TrackingMapProps {
  events: TrackingEvent[];
  height?: string;
  showRoute?: boolean;
}

export function TrackingMap({
  events,
  height = "500px",
  showRoute = true,
}: TrackingMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || events.length === 0) {
    return (
      <Card className="flex items-center justify-center p-8" style={{ height }}>
        <p className="text-gray-500">
          {events.length === 0 ? "No tracking data available" : "Loading map..."}
        </p>
      </Card>
    );
  }

  // Get latest position
  const latestEvent = events[0];
  const center: [number, number] = [latestEvent.lat, latestEvent.lng];

  // Create route path
  const routePath: [number, number][] = events.map((e) => [e.lat, e.lng]);

  return (
    <div style={{ height, width: "100%" }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Show route path */}
        {showRoute && events.length > 1 && (
          <Polyline positions={routePath} color="blue" weight={3} opacity={0.7} />
        )}

        {/* Show all position markers */}
        {events.map((event, index) => (
          <Marker key={event.id} position={[event.lat, event.lng]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">
                  {index === 0 ? "Current Position" : `Position ${events.length - index}`}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(event.ts).toLocaleString()}
                </p>
                <p className="text-xs">
                  {event.lat.toFixed(6)}°, {event.lng.toFixed(6)}°
                </p>
                {event.meta?.speed && (
                  <p className="text-xs">Speed: {event.meta.speed} knots</p>
                )}
                {event.meta?.course && (
                  <p className="text-xs">Course: {event.meta.course}°</p>
                )}
                <p className="text-xs text-gray-500">
                  Provider: {event.provider}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

