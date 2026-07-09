import { NextResponse } from "next/server";
import { RPC_URL, NETWORK_PASSPHRASE, CONTRACT_IDS } from "@/lib/artel-sdk";
import * as StellarSdk from "@stellar/stellar-sdk";

const ALLOWED_VIEWS = new Set([
  "get_state",
  "get_config",
  "get_member_info",
  "get_tickets",
  "get_leaderboard",
  "get_admin",
  "get_round_winner",
  "get_pool_count",
]);

function toNative(retval: StellarSdk.xdr.ScVal) {
  const native = StellarSdk.scValToNative(retval);
  return JSON.parse(JSON.stringify(native, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
}

async function callView(
  rpc: StellarSdk.rpc.Server,
  account: StellarSdk.Account,
  fn: string,
  poolId: number,
  extraAddr?: string,
  extraU32?: number,
) {
  const args: StellarSdk.xdr.ScVal[] = [StellarSdk.nativeToScVal(poolId, { type: "u32" })];
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
  if (!Number.isFinite(poolId) || poolId < 0) {
    return NextResponse.json({ error: "invalid pool_id" }, { status: 400 });
  }
  const fn = searchParams.get("fn");
  if (fn && !ALLOWED_VIEWS.has(fn)) {
    return NextResponse.json({ error: `view not allowed: ${fn}` }, { status: 400 });
  }
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
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message, pool_id: poolId }, { status: 500 });
  }
}
