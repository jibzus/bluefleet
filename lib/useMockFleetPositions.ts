"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { VesselPosition } from "@/types/vessel";

type MutableVessel = VesselPosition;

const INITIAL_VESSELS: VesselPosition[] = [
  {
    id: "bf-horizon",
    name: "BF Horizon",
    type: "Platform Supply",
    status: "enroute",
    heading: 78,
    speed: 14,
    updatedAt: new Date().toISOString(),
    position: { lat: 28.213, lng: -89.215 },
  },
  {
    id: "aurora-spirit",
    name: "Aurora Spirit",
    type: "Liquid Gas Carrier",
    status: "enroute",
    heading: 32,
    speed: 18,
    updatedAt: new Date().toISOString(),
    position: { lat: 36.622, lng: 7.213 },
  },
  {
    id: "pacific-runner",
    name: "Pacific Runner",
    type: "Crew Transfer",
    status: "enroute",
    heading: 249,
    speed: 21,
    updatedAt: new Date().toISOString(),
    position: { lat: 14.34, lng: 119.95 },
  },
  {
    id: "atlantic-dawn",
    name: "Atlantic Dawn",
    type: "DP2 Construction",
    status: "enroute",
    heading: 195,
    speed: 12,
    updatedAt: new Date().toISOString(),
    position: { lat: 58.46, lng: 1.85 },
  },
  {
    id: "beacon-star",
    name: "Beacon Star",
    type: "Anchor Handling",
    status: "enroute",
    heading: 132,
    speed: 11,
    updatedAt: new Date().toISOString(),
    position: { lat: -1.28, lng: 146.18 },
  },
  {
    id: "southern-tide",
    name: "Southern Tide",
    type: "Offshore Tug",
    status: "enroute",
    heading: 287,
    speed: 9,
    updatedAt: new Date().toISOString(),
    position: { lat: -33.12, lng: 17.96 },
  },
];

const KNOTS_TO_NM_PER_MS = 1 / 3600000;
const DEGREE_PER_NM_LAT = 1 / 60;

const randomizeHeading = (heading: number) => {
  const change = (Math.random() - 0.5) * 6;
  let next = heading + change;
  if (next < 0) next += 360;
  if (next >= 360) next -= 360;
  return next;
};

const advancePosition = (v: MutableVessel, deltaMs: number): VesselPosition => {
  const nauticalMiles = v.speed * deltaMs * KNOTS_TO_NM_PER_MS;
  const radians = (v.heading * Math.PI) / 180;
  const deltaLat = nauticalMiles * Math.cos(radians) * DEGREE_PER_NM_LAT;
  const latRadians = (v.position.lat * Math.PI) / 180;
  const degPerNmLon =
    Math.abs(Math.cos(latRadians)) < 0.001 ? 0 : DEGREE_PER_NM_LAT / Math.cos(latRadians);
  const deltaLon = nauticalMiles * Math.sin(radians) * degPerNmLon;

  let nextLat = v.position.lat + deltaLat;
  let nextLon = v.position.lng + deltaLon;

  if (nextLat > 89.9) nextLat = 89.9;
  if (nextLat < -89.9) nextLat = -89.9;
  if (nextLon > 180) nextLon -= 360;
  if (nextLon < -180) nextLon += 360;

  return {
    ...v,
    position: { lat: nextLat, lng: nextLon },
    heading: randomizeHeading(v.heading),
    updatedAt: new Date().toISOString(),
  };
};

export const useMockFleetPositions = () => {
  const [vessels, setVessels] = useState<VesselPosition[]>(() => INITIAL_VESSELS);
  const lastUpdateRef = useRef<number>(
    typeof performance === "undefined" ? Date.now() : performance.now(),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVessels((existing) => {
        const now = typeof performance === "undefined" ? Date.now() : performance.now();
        const deltaMs = now - lastUpdateRef.current;
        lastUpdateRef.current = now;

        return existing.map((v) => advancePosition(v, deltaMs));
      });
    }, 3500);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return useMemo(() => vessels, [vessels]);
};
