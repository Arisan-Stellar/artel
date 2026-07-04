import { NextResponse } from "next/server";

const RPC_URL = "https://soroban-testnet.stellar.org";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contractId = searchParams.get("contract_id");

  if (!contractId) {
    return NextResponse.json({ error: "contract_id required" }, { status: 400 });
  }

  try {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "simulateTransaction",
      params: {
        transaction: "", // populated with actual tx bytes in prod
      },
    };

    return NextResponse.json({
      contract_id: contractId,
      status: "ok",
      note: "Full integration requires Soroban RPC transaction building",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
