"use client";

import { useState, useCallback } from "react";

const RPC_URL = "https://soroban-testnet.stellar.org";
const TESTNET = "Test SDF Network ; September 2015";

async function connectFreighter(): Promise<string | null> {
  try {
    const mod = await import("@stellar/freighter-api");
    if (await mod.isConnected()) {
      const { address } = await mod.getAddress();
      return address;
    }
    const { address } = await mod.requestAccess();
    return address;
  } catch (e) {
    console.error("Freighter error:", e);
    return null;
  }
}

export function useFreighterTx() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const invokeContract = useCallback(async (contractId: string, method: string, args: any[]) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      const pubKey = await connectFreighter();
      if (!pubKey) throw new Error("Wallet not connected");

      const sdk = await import("@stellar/stellar-sdk");
      const rpc = new sdk.rpc.Server(RPC_URL, { allowHttp: false });
      const account = await rpc.getAccount(pubKey);

      const tx = new sdk.TransactionBuilder(account, {
        fee: sdk.BASE_FEE,
        networkPassphrase: TESTNET,
      })
        .addOperation(sdk.Operation.invokeContractFunction({ contract: contractId, function: method, args }))
        .setTimeout(30)
        .build();

      const sim = await rpc.simulateTransaction(tx);
      if (sdk.rpc.Api.isSimulationError(sim)) throw new Error("Simulation error");

      const assembled = sdk.rpc.assembleTransaction(tx, sim) as any;
      const txXdr = typeof assembled.toXDR === "function" ? assembled.toXDR() : String(assembled);

      const freighter = await import("@stellar/freighter-api");
      const signed = await freighter.signTransaction(txXdr, {
        networkPassphrase: TESTNET,
        address: pubKey,
      } as any);

      if (signed.error) throw new Error(String(signed.error));

      const sent = await rpc.sendTransaction(
        (sdk.TransactionBuilder as any).fromXDR(signed.signedTxXdr, TESTNET)
      );

      if (sent.hash) { setTxHash(sent.hash); setLoading(false); return { hash: sent.hash, success: true }; }
      throw new Error("No hash");
    } catch (e: any) {
      setError(e.message || String(e)); setLoading(false); return { hash: "", success: false };
    }
  }, []);

  return { loading, error, txHash, invokeContract };
}

export function scvAddress(addr: string) {
  return { type: "address" as any, value: addr };
}
