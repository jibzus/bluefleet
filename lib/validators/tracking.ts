import { z } from "zod";

// Tracking Event Schema
export const trackingEventSchema = z.object({
  vesselId: z.string().min(1, "Vessel ID is required"),
  bookingId: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  ts: z.string().or(z.date()),
  provider: z.enum(["MARINETRAFFIC", "EXACTEARTH", "MANUAL"]),
  meta: z.record(z.any()).optional(),
});

// Tracking Query Schema
export const trackingQuerySchema = z.object({
  vesselId: z.string().optional(),
  bookingId: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  limit: z.number().min(1).max(1000).default(100),
});

// AIS Provider Response Types
export interface MarineTrafficPosition {
  mmsi: string;
  imo?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  course?: number;
  heading?: number;
  status?: string;
}

export interface ExactEarthPosition {
  vessel_id: string;
  lat: number;
  lon: number;
  timestamp: string;
  sog?: number; // Speed over ground
  cog?: number; // Course over ground
  heading?: number;
}

// Format tracking event for display
export function formatTrackingEvent(event: any): {
  position: string;
  timestamp: string;
  provider: string;
  speed?: string;
  course?: string;
} {
  const lat = event.lat.toFixed(6);
  const lng = event.lng.toFixed(6);
  const latDir = event.lat >= 0 ? "N" : "S";
  const lngDir = event.lng >= 0 ? "E" : "W";

  return {
    position: `${Math.abs(event.lat).toFixed(6)}°${latDir}, ${Math.abs(event.lng).toFixed(6)}°${lngDir}`,
    timestamp: new Date(event.ts).toLocaleString(),
    provider: event.provider,
    speed: event.meta?.speed ? `${event.meta.speed} knots` : undefined,
    course: event.meta?.course ? `${event.meta.course}°` : undefined,
  };
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // in km
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Calculate total route distance
export function calculateRouteDistance(events: any[]): number {
  if (events.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1];
    const curr = events[i];
    totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
  }

  return totalDistance;
}

// Get route bounds for map centering
export function getRouteBounds(events: any[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  center: { lat: number; lng: number };
} {
  if (events.length === 0) {
    return {
      minLat: 0,
      maxLat: 0,
      minLng: 0,
      maxLng: 0,
      center: { lat: 0, lng: 0 },
    };
  }

  const lats = events.map((e) => e.lat);
  const lngs = events.map((e) => e.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
    center: {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    },
  };
}

// Fetch vessel position from MarineTraffic API
export async function fetchMarineTrafficPosition(
  mmsi: string
): Promise<MarineTrafficPosition | null> {
  try {
    const apiKey = process.env.MARINETRAFFIC_API_KEY;
    if (!apiKey) {
      console.warn("MarineTraffic API key not configured");
      return null;
    }

    // MarineTraffic API endpoint
    const url = `https://services.marinetraffic.com/api/exportvessel/v:8/${apiKey}/timespan:60/protocol:json/mmsi:${mmsi}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`MarineTraffic API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const vessel = data[0];
    return {
      mmsi: vessel.MMSI,
      imo: vessel.IMO,
      latitude: parseFloat(vessel.LAT),
      longitude: parseFloat(vessel.LON),
      timestamp: vessel.TIMESTAMP,
      speed: parseFloat(vessel.SPEED),
      course: parseFloat(vessel.COURSE),
      heading: parseFloat(vessel.HEADING),
      status: vessel.STATUS,
    };
  } catch (error) {
    console.error("MarineTraffic API error:", error);
    return null;
  }
}

// Fetch vessel position from exactEarth API (failover)
export async function fetchExactEarthPosition(
  vesselId: string
): Promise<ExactEarthPosition | null> {
  try {
    const apiKey = process.env.EXACTEARTH_API_KEY;
    if (!apiKey) {
      console.warn("exactEarth API key not configured");
      return null;
    }

    // exactEarth API endpoint (example - adjust based on actual API)
    const url = `https://api.exactearth.com/v1/vessels/${vesselId}/position`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`exactEarth API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      vessel_id: data.vessel_id,
      lat: data.latitude,
      lon: data.longitude,
      timestamp: data.timestamp,
      sog: data.speed_over_ground,
      cog: data.course_over_ground,
      heading: data.heading,
    };
  } catch (error) {
    console.error("exactEarth API error:", error);
    return null;
  }
}

// Fetch vessel position with failover
export async function fetchVesselPosition(
  mmsi: string,
  vesselId: string
): Promise<{
  lat: number;
  lng: number;
  timestamp: Date;
  provider: "MARINETRAFFIC" | "EXACTEARTH";
  meta: any;
} | null> {
  // Try MarineTraffic first
  const mtPosition = await fetchMarineTrafficPosition(mmsi);
  if (mtPosition) {
    return {
      lat: mtPosition.latitude,
      lng: mtPosition.longitude,
      timestamp: new Date(mtPosition.timestamp),
      provider: "MARINETRAFFIC",
      meta: {
        speed: mtPosition.speed,
        course: mtPosition.course,
        heading: mtPosition.heading,
        status: mtPosition.status,
      },
    };
  }

  // Failover to exactEarth
  const eePosition = await fetchExactEarthPosition(vesselId);
  if (eePosition) {
    return {
      lat: eePosition.lat,
      lng: eePosition.lon,
      timestamp: new Date(eePosition.timestamp),
      provider: "EXACTEARTH",
      meta: {
        speed: eePosition.sog,
        course: eePosition.cog,
        heading: eePosition.heading,
      },
    };
  }

  return null;
}

// Check if tracking data is stale (> 15 minutes old)
export function isTrackingStale(lastUpdate: Date): boolean {
  const now = new Date();
  const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
  return diffMinutes > 15;
}

// Get vessel status based on tracking data
export function getVesselStatus(
  lastEvent: any | null
): "ACTIVE" | "STALE" | "OFFLINE" {
  if (!lastEvent) return "OFFLINE";
  if (isTrackingStale(new Date(lastEvent.ts))) return "STALE";
  return "ACTIVE";
}

