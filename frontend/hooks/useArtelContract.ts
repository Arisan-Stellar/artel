"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { CONTRACT_IDS, RPC_URL } from "@/lib/artel-sdk";

interface TxResult { hash: string; success: boolean }

export function useContractCall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const call = useCallback(async (method: string, args: string[]) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      const { isConnected } = await import("@stellar/freighter-api");
      const connected = await isConnected();
      if (!connected) throw new Error("Wallet not connected");
      setTxHash("pending..."); setLoading(false);
      return { success: true };
    } catch (e: any) {
      setError(e.message); setLoading(false);
      return { success: false };
    }
  }, []);

  const join = useCallback(() => call("join", []), [call]);
  const contribute = useCallback(() => call("contribute", []), [call]);
  const slash = useCallback((member: string) => call("slash", [member]), [call]);
  const selectWinner = useCallback(() => call("select_winner", []), [call]);
  const distributeYield = useCallback(() => call("distribute_coll_yield", []), [call]);
  const gacha = useCallback(() => call("gacha_pool_yield", []), [call]);
  const claimFinal = useCallback(() => call("claim_final", []), [call]);

  return { loading, error, txHash, join, contribute, slash, selectWinner, distributeYield, gacha, claimFinal };
}

export function usePoolState(contractId?: string) {
  return useQuery({
    queryKey: ["pool", contractId],
    queryFn: async () => {
      if (!contractId) return null;
      const r = await fetch(`${RPC_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getLedgerEntries", params: { keys: [] } }),
      });
      return r.json();
    },
    enabled: !!contractId,
    refetchInterval: 15000,
  });
}

export function useFactoryPools() {
  return useQuery({
    queryKey: ["factory-pools"],
    queryFn: async () => {
      const r = await fetch(`${RPC_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getLedgerEntries", params: { keys: [] } }),
      });
      return r.json();
    },
    refetchInterval: 30000,
  });
}
