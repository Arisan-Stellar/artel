import { NextResponse } from "next/server";
import { RPC_URL, NETWORK_PASSPHRASE, CONTRACT_IDS } from "@/lib/artel-sdk";
import * as StellarSdk from "@stellar/stellar-sdk";

function toNative(retval: any) {
  const native = StellarSdk.scValToNative(retval);
  return JSON.parse(JSON.stringify(native, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
}

async function callView(rpc: any, account: any, fn: string, poolId: number, extraAddr?: string, extraU32?: number) {
  const args: any[] = [StellarSdk.nativeToScVal(poolId, { type: "u32" })];
  if (extraAddr) args.push(StellarSdk.Address.fromString(extraAddr).toScVal());
  if (extraU32 !== undefined) args.push(StellarSdk.nativeToScVal(extraU32, { type: "u32" }));

  const tx = new StellarSdk.TransactionBuilder(account, { fee: "100", networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(StellarSdk.Operation.invokeContractFunction({
      contract: CONTRACT_IDS.pool,
      function: fn,
      args,
    }))
    .setTimeout(30)
    .build();
  const sim = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationSuccess(sim) && sim.result?.retval) {
    return toNative(sim.result.retval);
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const poolIdParam = searchParams.get("pool_id");

  if (poolIdParam === null) {
    return NextResponse.json({ error: "pool_id required" }, { status: 400 });
  }
  const poolId = Number(poolIdParam);
  const fn = searchParams.get("fn");
  const member = searchParams.get("member") || undefined;
  const roundParam = searchParams.get("round");
  const round = roundParam !== null ? Number(roundParam) : undefined;

  try {
    const rpc = new StellarSdk.rpc.Server(RPC_URL, { allowHttp: false });
    const account = new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");

    if (fn && fn !== "get_state") {
      const result = await callView(rpc, account, fn, poolId, member, round);
      return NextResponse.json({ pool_id: poolId, [fn]: result, success: true });
    }

    const state = await callView(rpc, account, "get_state", poolId);
    if (!state) {
      return NextResponse.json({ error: "Pool not found", pool_id: poolId }, { status: 404 });
    }
    const config = await callView(rpc, account, "get_config", poolId);

    return NextResponse.json({ pool_id: poolId, state, config, success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, pool_id: poolId }, { status: 500 });
  }
}
