import { NextResponse } from "next/server";
import { getDefaultUserId } from "@/auth";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    return NextResponse.json({ userId });
  } catch {
    return NextResponse.json({ userId: null }, { status: 503 });
  }
}
