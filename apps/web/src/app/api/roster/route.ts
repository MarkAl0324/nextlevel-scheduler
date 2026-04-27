import { NextResponse } from "next/server";
import { getRosterData } from "@/lib/serverData";
import type { IsoDate } from "@/lib/demoData";

function isIsoDate(v: string | null): v is IsoDate {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  if (!isIsoDate(date)) {
    return NextResponse.json({ error: "Invalid date. Expected YYYY-MM-DD." }, { status: 400 });
  }

  const roster = await getRosterData(date);
  return NextResponse.json(roster);
}

