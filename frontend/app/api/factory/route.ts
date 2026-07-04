import { NextResponse } from "next/server";

const FACTORY_ID = "CCDM7FMETTVS5NO2UOLFNBOYZJTNZLG6QOVONEGJD4YYTVKURAIU6ABE";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK = "Test SDF Network ; September 2015";

export async function GET() {
  try {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: {
        keys: [],
      },
    };

    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json({
      factory: FACTORY_ID,
      network: NETWORK,
      pools: [],
      raw: data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
