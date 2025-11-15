import { NextResponse } from "next/server";
import { mockAds } from "@/data/ads";

export async function GET() {
  return NextResponse.json(mockAds);
}
