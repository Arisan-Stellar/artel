import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    if (!address || !address.startsWith("G")) {
      return NextResponse.json({ error: "Invalid Stellar address" }, { status: 400 });
    }

    const res = await fetch(`https://friendbot.stellar.org/?addr=${address}`);
    const data = await res.json();

    // Friendbot returns 400 if already funded — that's OK
    if (data.successful === true) {
      return NextResponse.json({ success: true, address, amount: "10,000 XLM", txHash: data.hash });
    }
    if (data.status === 400 && data.detail?.includes("already funded")) {
      return NextResponse.json({ success: true, address, amount: "Already funded", note: "Account already has XLM" });
    }

    return NextResponse.json({ error: data.detail || "Claim failed" }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
