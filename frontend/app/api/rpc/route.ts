import { NextResponse } from "next/server";

const RPC_URL = "https://soroban-testnet.stellar.org";

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
