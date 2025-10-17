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
}

