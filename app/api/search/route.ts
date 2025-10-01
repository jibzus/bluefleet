import { NextResponse } from "next/server";
// Edge-friendly placeholder
export const runtime = "edge";
export async function GET() {
  // TODO: implement faceted search backed by Postgres
  return NextResponse.json({ results: [] });
}
