export type Role = "OWNER" | "OPERATOR" | "ADMIN" | "REGULATOR";
export const can = {
  viewAdmin: (role: Role) => role === "ADMIN",
  viewRegulator: (role: Role) => role === "REGULATOR" || role === "ADMIN",
};
