import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    pools: [],
    note: "Populated from Soroban RPC when ArisanFactory contract is deployed",
  });
}
