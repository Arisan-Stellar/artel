import { NextResponse } from "next/server";
import { RPC_URL } from "@/lib/artel-sdk";

const ALLOWED_METHODS = new Set([
  "getHealth",
  "getNetwork",
  "getLatestLedger",
  "getLedgerEntries",
  "getEvents",
  "simulateTransaction",
  "sendTransaction",
  "getTransaction",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const method = typeof body?.method === "string" ? body.method : "";
    if (!ALLOWED_METHODS.has(method)) {
      return NextResponse.json({ error: `RPC method not allowed: ${method || "(none)"}` }, { status: 400 });
    }

    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
