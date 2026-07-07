import { NextResponse } from "next/server";
import { RPC_URL, NETWORK_PASSPHRASE, CONTRACT_IDS } from "@/lib/artel-sdk";
import * as StellarSdk from "@stellar/stellar-sdk";

export async function GET() {
  try {
    const rpc = new StellarSdk.rpc.Server(RPC_URL, { allowHttp: false });
    const account = new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");

    const tx = new StellarSdk.TransactionBuilder(account, { fee: "100", networkPassphrase: NETWORK_PASSPHRASE })
      .addOperation(StellarSdk.Operation.invokeContractFunction({
        contract: CONTRACT_IDS.pool,
        function: "get_pool_count",
        args: [],
      }))
      .setTimeout(30)
      .build();

    const sim = await rpc.simulateTransaction(tx);
    let count = 0;
    if (StellarSdk.rpc.Api.isSimulationSuccess(sim) && sim.result?.retval) {
      count = Number(StellarSdk.scValToNative(sim.result.retval));
    }

    return NextResponse.json({ count, success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e), count: 0 }, { status: 500 });
  }
}

