"use client";

import { useState, useCallback } from "react";
import { Address, nativeToScVal } from "@stellar/stellar-sdk";
import type { rpc as SorobanRpc, xdr } from "@stellar/stellar-sdk";
import { useWallet } from "./WalletContext";

const RPC_URL = "https://soroban-testnet.stellar.org";
const TESTNET = "Test SDF Network ; September 2015";

function errMessage(e: unknown): string {
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  return JSON.stringify(e);
}

async function waitForTx(
  rpc: SorobanRpc.Server,
  hash: string,
  maxRetries = 20,
): Promise<SorobanRpc.Api.GetTransactionResponse> {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await rpc.getTransaction(hash);
    if (res.status !== "NOT_FOUND") return res;
  }
  throw new Error(`Transaction timeout after ${maxRetries * 2}s (hash: ${hash})`);
}

async function getPubKey(walletType: string): Promise<string | null> {
  try {
    if (walletType === "albedo") {
      const albedo = (await import("@albedo-link/intent")).default;
      const res = await albedo.publicKey({});
      return res.pubkey || null;
    }
    if (walletType === "xbull") {
      const mod = await import("@creit.tech/xbull-wallet-connect");
      const bridge = new mod.xBullWalletConnect();
      const pk = await bridge.connect();
      bridge.closeConnections();
      return pk || null;
    }
    if (walletType === "lobstr") {
      const { getPublicKey } = await import("@lobstrco/signer-extension-api");
      return (await getPublicKey()) || null;
    }
    const mod = await import("@stellar/freighter-api");
    const connected = await mod.isConnected();
    if (connected?.isConnected) {
      const { address } = await mod.getAddress();
      if (address) return address;
    }
    const { address } = await mod.requestAccess();
    return address || null;
  } catch (e) {
    console.error("Wallet connect error:", errMessage(e));
    return null;
  }
}

async function signXdr(walletType: string, txXdr: string, pubKey: string): Promise<string> {
  if (walletType === "albedo") {
    const albedo = (await import("@albedo-link/intent")).default;
    const res = await albedo.tx({ xdr: txXdr, network: "testnet", pubkey: pubKey });
    return res.signed_envelope_xdr;
  }
  if (walletType === "xbull") {
    const mod = await import("@creit.tech/xbull-wallet-connect");
    const bridge = new mod.xBullWalletConnect();
    const signedXdr = await bridge.sign({ xdr: txXdr, publicKey: pubKey, network: "TESTNET" });
    bridge.closeConnections();
    return signedXdr;
  }
  if (walletType === "lobstr") {
    const { signTransaction } = await import("@lobstrco/signer-extension-api");
    return await signTransaction(txXdr);
  }
  const freighter = await import("@stellar/freighter-api");
  const signed = await freighter.signTransaction(txXdr, { networkPassphrase: TESTNET, address: pubKey });
  if (signed.error) {
    const se = signed.error;
    throw new Error("Freighter: " + errMessage(se));
  }
  return signed.signedTxXdr;
}

export function useFreighterTx() {
  const { walletType, address: ctxAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const invokeContract = useCallback(async (contractId: string, method: string, args: xdr.ScVal[]) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      const wt = walletType === "none" ? "freighter" : walletType;
      const pubKey = ctxAddress || (await getPubKey(wt));
      if (!pubKey) throw new Error("Wallet not connected");

      const sdk = await import("@stellar/stellar-sdk");
      const rpc = new sdk.rpc.Server(RPC_URL, { allowHttp: false });
      const account = await rpc.getAccount(pubKey);

      const tx = new sdk.TransactionBuilder(account, {
        fee: sdk.BASE_FEE,
        networkPassphrase: TESTNET,
      })
        .addOperation(sdk.Operation.invokeContractFunction({ contract: contractId, function: method, args }))
        .setTimeout(300)
        .build();

      const sim = await rpc.simulateTransaction(tx);
      if (sdk.rpc.Api.isSimulationError(sim)) {
        throw new Error("Simulation failed: " + (typeof sim.error === "string" ? sim.error : JSON.stringify(sim.error)));
      }

      const assembled = sdk.rpc.assembleTransaction(tx, sim).build();
      const txXdr = assembled.toXDR();

      const signedTxXdr = await signXdr(wt, txXdr, pubKey);

      const sent = await rpc.sendTransaction(sdk.TransactionBuilder.fromXDR(signedTxXdr, TESTNET));

      if (sent.status === "ERROR") {
        throw new Error("Send failed: " + JSON.stringify(sent.errorResult));
      }
      if (!sent.hash) {
        throw new Error("No hash returned from sendTransaction");
      }

      const result = await waitForTx(rpc, sent.hash);
      if (result.status === "SUCCESS") {
        setTxHash(sent.hash);
        setLoading(false);
        return { hash: sent.hash, success: true };
      }
      throw new Error(`Transaction ${result.status}`);
    } catch (e: unknown) {
      setError(errMessage(e)); setLoading(false); return { hash: "", success: false };
    }
  }, [walletType, ctxAddress]);

  return { loading, error, txHash, invokeContract };
}

export function scvAddress(addr: string) {
  return Address.fromString(addr).toScVal();
}

export function scvU32(n: number) {
  return nativeToScVal(n, { type: "u32" });
}
