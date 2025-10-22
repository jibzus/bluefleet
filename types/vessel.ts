export interface VesselPosition {
  id: string;
  name: string;
  type: string;
  status: "enroute" | "idle" | "port" | "maintenance";
  heading: number;
  speed: number; // knots
  updatedAt: string;
  position: {
    lat: number;
    lng: number;
  };
  // Additional vessel details for enhanced display
  imoNumber?: string;
  destination?: string;
  eta?: string; // ISO date string
  flag?: string;
  dwt?: number; // Deadweight tonnage
}

