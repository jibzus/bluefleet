"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MaplibreMap, type Marker, type Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { useMockFleetPositions } from "@/lib/useMockFleetPositions";
import type { VesselPosition } from "@/types/vessel";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const MAP_CENTER: [number, number] = [-10, 22];
const MAP_ZOOM = 2;

const markerElement = () => {
  const el = document.createElement("div");
  el.style.width = "16px";
  el.style.height = "16px";
  el.style.borderRadius = "9999px";
  el.style.background = "linear-gradient(135deg, #38bdf8, #0f172a)";
  el.style.boxShadow = "0 0 0 2px rgba(15, 23, 42, 0.6)";
  el.style.border = "1px solid rgba(148, 163, 184, 0.35)";
  el.style.transformOrigin = "center";
  el.style.cursor = "pointer";
  el.style.transition = "transform 150ms ease, box-shadow 150ms ease";

  el.addEventListener("mouseenter", () => {
    el.style.transform = "scale(1.2)";
    el.style.boxShadow = "0 0 0 3px rgba(56, 189, 248, 0.45)";
  });

  el.addEventListener("mouseleave", () => {
    el.style.transform = "scale(1)";
    el.style.boxShadow = "0 0 0 2px rgba(15, 23, 42, 0.6)";
  });

  return el;
};

const createPopupFor = (vessel: VesselPosition) =>
  new maplibregl.Popup({
    closeButton: false,
    offset: 18,
    className: "fleet-popup",
  }).setHTML(
    `<div style="display:flex;flex-direction:column;gap:4px;min-width:180px;">
       <div style="font-weight:600;color:#0f172a;font-size:14px;">${vessel.name}</div>
       <div style="font-size:12px;color:#475569;">${vessel.type}</div>
       <div style="display:flex;justify-content:space-between;font-size:11px;color:#334155;">
         <span>${vessel.status}</span>
         <span>${vessel.speed.toFixed(0)} kn</span>
       </div>
     </div>`,
  );

const updatePopupContent = (popup: Popup | undefined, vessel: VesselPosition) => {
  popup?.setHTML(
    `<div style="display:flex;flex-direction:column;gap:4px;min-width:180px;">
       <div style="font-weight:600;color:#0f172a;font-size:14px;">${vessel.name}</div>
       <div style="font-size:12px;color:#475569;">${vessel.type}</div>
       <div style="display:flex;justify-content:space-between;font-size:11px;color:#334155;">
         <span>${vessel.status}</span>
         <span>${vessel.speed.toFixed(0)} kn</span>
       </div>
       <div style="display:flex;justify-content:space-between;font-size:11px;color:#334155;">
         <span>Course</span>
         <span>${Math.round(vessel.heading)}°</span>
       </div>
       <div style="font-size:10px;color:#64748b;">Updated ${new Date(
         vessel.updatedAt,
       ).toLocaleTimeString()}</div>
     </div>`,
  );
};

export function LiveFleetMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
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
          element: markerElement(),
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
