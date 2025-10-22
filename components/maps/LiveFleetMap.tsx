"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MaplibreMap, type Marker, type Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { useMockFleetPositions } from "@/lib/useMockFleetPositions";
import type { VesselPosition } from "@/types/vessel";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const MAP_CENTER: [number, number] = [-10, 22];
const MAP_ZOOM = 2;

// Get color based on vessel status
const getStatusColor = (status: VesselPosition["status"]) => {
  switch (status) {
    case "enroute":
      return "#3b82f6"; // blue
    case "idle":
      return "#eab308"; // yellow
    case "port":
      return "#22c55e"; // green
    case "maintenance":
      return "#ef4444"; // red
    default:
      return "#3b82f6";
  }
};

const markerElement = (status: VesselPosition["status"], heading: number = 0) => {
  const color = getStatusColor(status);

  // Create a stable container with fixed dimensions
  const container = document.createElement("div");
  container.style.width = "40px";
  container.style.height = "40px";
  container.style.position = "relative";
  container.style.cursor = "pointer";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";

  // Create the visual ship icon that will scale and rotate
  const iconWrapper = document.createElement("div");
  iconWrapper.style.width = "28px";
  iconWrapper.style.height = "28px";
  iconWrapper.style.transition = "transform 150ms ease, filter 150ms ease";
  iconWrapper.style.filter = "drop-shadow(0 2px 6px rgba(0,0,0,0.4))";
  iconWrapper.style.transformOrigin = "center center";
  iconWrapper.style.transform = `rotate(${heading}deg)`; // Rotate based on vessel heading
  iconWrapper.style.pointerEvents = "none"; // Let clicks pass through to container

  // Modern vessel silhouette icon (similar to MarineTraffic/VesselFinder)
  iconWrapper.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Ship hull -->
      <path d="M14 4 L18 12 L18 18 L10 18 L10 12 Z" fill="${color}" stroke="white" stroke-width="1.2" stroke-linejoin="round"/>
      <!-- Bow (front pointed section) -->
      <path d="M14 4 L16 8 L12 8 Z" fill="${color}" stroke="white" stroke-width="1.2" stroke-linejoin="round"/>
      <!-- Superstructure -->
      <rect x="11" y="10" width="6" height="4" fill="${color}" stroke="white" stroke-width="1" rx="0.5"/>
      <!-- Bridge -->
      <rect x="12" y="8" width="4" height="2" fill="white" stroke="${color}" stroke-width="0.8" rx="0.3"/>
      <!-- Hull bottom -->
      <path d="M10 18 L9 22 L19 22 L18 18 Z" fill="${color}" stroke="white" stroke-width="1.2" stroke-linejoin="round"/>
      <!-- Direction indicator (bow marker) -->
      <circle cx="14" cy="5" r="1.5" fill="white" stroke="${color}" stroke-width="0.8"/>
    </svg>
  `;

  container.appendChild(iconWrapper);

  // Hover effects on the stable container
  container.addEventListener("mouseenter", () => {
    iconWrapper.style.transform = `rotate(${heading}deg) scale(1.2)`;
    iconWrapper.style.filter = "drop-shadow(0 4px 10px rgba(0,0,0,0.5))";
  });

  container.addEventListener("mouseleave", () => {
    iconWrapper.style.transform = `rotate(${heading}deg) scale(1)`;
    iconWrapper.style.filter = "drop-shadow(0 2px 6px rgba(0,0,0,0.4))";
  });

  return container;
};

const formatETA = (eta?: string) => {
  if (!eta) return "N/A";
  const date = new Date(eta);
  const now = new Date();
  const diffHours = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));

  if (diffHours < 1) return "< 1 hour";
  if (diffHours === 1) return "1 hour";
  return `${diffHours} hours`;
};

const getPopupHTML = (vessel: VesselPosition) => `
  <div style="display:flex;flex-direction:column;gap:8px;min-width:240px;font-family:system-ui,-apple-system,sans-serif;">
    <div style="border-bottom:1px solid #e2e8f0;padding-bottom:8px;">
      <div style="font-weight:700;color:#0f172a;font-size:15px;margin-bottom:2px;">${vessel.name}</div>
      <div style="font-size:12px;color:#64748b;">${vessel.type}</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;">
      <div>
        <div style="color:#64748b;margin-bottom:2px;">IMO Number</div>
        <div style="color:#0f172a;font-weight:600;">${vessel.imoNumber || "N/A"}</div>
      </div>
      <div>
        <div style="color:#64748b;margin-bottom:2px;">Flag</div>
        <div style="color:#0f172a;font-weight:600;">${vessel.flag || "N/A"}</div>
      </div>
      <div>
        <div style="color:#64748b;margin-bottom:2px;">Speed</div>
        <div style="color:#0f172a;font-weight:600;">${vessel.speed.toFixed(1)} knots</div>
      </div>
      <div>
        <div style="color:#64748b;margin-bottom:2px;">Course</div>
        <div style="color:#0f172a;font-weight:600;">${Math.round(vessel.heading)}°</div>
      </div>
      <div>
        <div style="color:#64748b;margin-bottom:2px;">Status</div>
        <div style="color:#0f172a;font-weight:600;text-transform:capitalize;">${vessel.status}</div>
      </div>
      <div>
        <div style="color:#64748b;margin-bottom:2px;">DWT</div>
        <div style="color:#0f172a;font-weight:600;">${vessel.dwt ? vessel.dwt.toLocaleString() + " t" : "N/A"}</div>
      </div>
    </div>

    ${vessel.destination ? `
      <div style="background:#f1f5f9;padding:8px;border-radius:6px;font-size:11px;">
        <div style="color:#64748b;margin-bottom:2px;">Destination</div>
        <div style="color:#0f172a;font-weight:600;">${vessel.destination}</div>
        <div style="color:#64748b;margin-top:4px;">ETA: ${formatETA(vessel.eta)}</div>
      </div>
    ` : ""}

    <a
      href="/search?vessel=${encodeURIComponent(vessel.name)}"
      style="
        display:block;
        background:linear-gradient(135deg,#3b82f6,#2563eb);
        color:white;
        text-align:center;
        padding:10px;
        border-radius:6px;
        text-decoration:none;
        font-weight:600;
        font-size:13px;
        transition:all 150ms ease;
        box-shadow:0 2px 4px rgba(59,130,246,0.3);
      "
      onmouseover="this.style.background='linear-gradient(135deg,#2563eb,#1d4ed8)';this.style.boxShadow='0 4px 8px rgba(59,130,246,0.4)'"
      onmouseout="this.style.background='linear-gradient(135deg,#3b82f6,#2563eb)';this.style.boxShadow='0 2px 4px rgba(59,130,246,0.3)'"
    >
      Book This Vessel
    </a>

    <div style="font-size:10px;color:#94a3b8;text-align:center;">
      Last updated: ${new Date(vessel.updatedAt).toLocaleTimeString()}
    </div>
  </div>
`;

const createPopupFor = (vessel: VesselPosition) =>
  new maplibregl.Popup({
    closeButton: true,
    offset: 25,
    className: "fleet-popup",
    maxWidth: "280px",
  }).setHTML(getPopupHTML(vessel));

const updatePopupContent = (popup: Popup | undefined, vessel: VesselPosition) => {
  popup?.setHTML(getPopupHTML(vessel));
};

export function LiveFleetMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const hasOpenedInitialPopup = useRef(false);
  const positions = useMockFleetPositions();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
    });

    mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    mapRef.current = mapInstance;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      mapInstance.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const activeIds = new Set<string>();

    positions.forEach((vessel) => {
      activeIds.add(vessel.id);

      const lngLat: [number, number] = [vessel.position.lng, vessel.position.lat];
      let marker = markersRef.current.get(vessel.id);

      if (!marker) {
        const popup = createPopupFor(vessel);
        marker = new maplibregl.Marker({
          element: markerElement(vessel.status, vessel.heading),
          rotationAlignment: "map",
          pitchAlignment: "map",
        })
          .setLngLat(lngLat)
          .setRotation(vessel.heading)
          .setPopup(popup);

        marker.addTo(map);
        markersRef.current.set(vessel.id, marker);
      } else {
        marker.setLngLat(lngLat).setRotation(vessel.heading);
        updatePopupContent(marker.getPopup(), vessel);
      }
    });

    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Auto-open a random popup on initial load (only once)
    if (!hasOpenedInitialPopup.current && markersRef.current.size > 0) {
      hasOpenedInitialPopup.current = true;

      // Get all marker IDs and select a random one
      const markerIds = Array.from(markersRef.current.keys());
      const randomIndex = Math.floor(Math.random() * markerIds.length);
      const randomMarkerId = markerIds[randomIndex];
      const randomMarker = markersRef.current.get(randomMarkerId);

      // Open the popup for the random marker
      if (randomMarker) {
        randomMarker.togglePopup();
      }
    }
  }, [positions]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1 rounded-lg bg-slate-900/80 px-4 py-2 text-xs text-slate-100 shadow-lg">
        <span className="text-sm font-semibold">Live Fleet Activity</span>
        <span className="text-xs text-slate-300">Mock data updating every few seconds</span>
      </div>
    </div>
  );
}

export default LiveFleetMap;
