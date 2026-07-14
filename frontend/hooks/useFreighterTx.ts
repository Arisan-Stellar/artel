"use client";

import { useState, useCallback } from "react";
import { Address, nativeToScVal } from "@stellar/stellar-sdk";
import type { rpc as SorobanRpc, xdr } from "@stellar/stellar-sdk";
import { useWallet } from "./WalletContext";
import { RPC_URL, NETWORK_PASSPHRASE, NETWORK } from "@/lib/artel-sdk";

const WALLET_NET_ALBEDO = NETWORK === "public" ? "public" : "testnet";
const WALLET_NET_XBULL = NETWORK === "public" ? "PUBLIC" : "TESTNET";

const ERROR_MAP: [RegExp, string][] = [
  // Assertion messages dari contract (paling umum)
  [/not all active members have deposited/i, "⏳ Belum semua anggota bayar iuran ronde ini. Tunggu semua deposit dulu."],
  [/no eligible winner this round/i, "Tidak ada anggota yang eligible untuk menang. Semua mungkin sudah menang."],
  [/pool not active/i, "Pool belum aktif / belum dimulai."],
  [/pool not accepting members/i, "Pool sudah tidak menerima anggota baru."],
  [/already a member/i, "Kamu sudah menjadi anggota pool ini."],
  [/already deposited this round/i, "Kamu sudah bayar iuran untuk ronde ini."],
  [/pool is full/i, "Pool sudah penuh. Gabung ke pool lain yang masih buka."],
  [/pool is paused/i, "Pool sedang dijeda oleh admin."],
  [/not a member/i, "Kamu bukan anggota pool ini."],
  [/member is not active/i, "Akun member tidak aktif."],
  [/can only exit before pool starts/i, "Cuma bisa keluar sebelum pool dimulai."],
  [/no pending payout/i, "Tidak ada kemenangan yang bisa dicairkan."],
  [/payout already claimed/i, "Kemenangan sudah pernah dicairkan sebelumnya."],
  [/pool not completed/i, "Pool belum selesai. Tunggu sampai semua ronde selesai."],
  [/no yield to distribute/i, "Belum ada yield yang bisa dibagikan."],
  [/only admin|admin only|admin require/i, "Hanya admin pool yang bisa melakukan aksi ini."],
  [/already claimed|gacha_claimed/i, "Sudah pernah diklaim sebelumnya."],
  [/need at least 2 members/i, "Minimal 2 anggota untuk membuat pool."],
  [/contribution must be positive/i, "Jumlah iuran harus lebih dari 0."],
  [/slash.*period not reached/i, "Belum waktunya potong collateral — grace period belum lewat."],
  [/member already deposited/i, "Anggota ini sudah deposit ronde ini."],
  [/no new yield to distribute/i, "Belum ada yield baru yang bisa dibagikan."],
  // Wallet / koneksi errors
  [/Wallet not connected/i, "Wallet belum terhubung. Klik CONNECT dulu."],
  [/user rejected/i, "Transaksi dibatalkan di wallet."],
  [/txTooLate|timeout/i, "Transaksi terlalu lama — coba lagi."],
  [/insufficient.*balance|source account balance/i, "Saldo XLM tidak cukup untuk transaksi ini."],
  [/Send failed/i, "Gagal mengirim transaksi ke jaringan Stellar."],
  [/Simulation failed/i, "Kontrak menolak transaksi. Cek kondisi pool."],
  [/ContractError|HostError/i, "Error dari smart contract. Cek apakah data yang dimasukkan benar."],
];

function friendlyError(raw: string): string {
  for (const [pattern, msg] of ERROR_MAP) {
    if (pattern.test(raw)) return msg;
  }
  // Kalau ada assertion message yang kelihatan di error, extract
  const quoteMatch = raw.match(/"([^"]{10,})"/);
  if (quoteMatch) return `Error: ${quoteMatch[1]}`;
  // Fallback: potong supaya gak kepanjangan
  if (raw.length > 120) return raw.slice(0, 120) + "...";
  return raw;
}

function errMessage(e: unknown): string {
  if (typeof e === "string") return friendlyError(e);
  if (e instanceof Error) return friendlyError(e.message);
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
    const res = await albedo.tx({ xdr: txXdr, network: WALLET_NET_ALBEDO, pubkey: pubKey });
    return res.signed_envelope_xdr;
  }
  if (walletType === "xbull") {
    const mod = await import("@creit.tech/xbull-wallet-connect");
    const bridge = new mod.xBullWalletConnect();
    const signedXdr = await bridge.sign({ xdr: txXdr, publicKey: pubKey, network: WALLET_NET_XBULL });
    bridge.closeConnections();
    return signedXdr;
  }
  if (walletType === "lobstr") {
    const { signTransaction } = await import("@lobstrco/signer-extension-api");
    return await signTransaction(txXdr);
  }
  const freighter = await import("@stellar/freighter-api");
  const signed = await freighter.signTransaction(txXdr, { networkPassphrase: NETWORK_PASSPHRASE, address: pubKey });
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
        networkPassphrase: NETWORK_PASSPHRASE,
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

      const sent = await rpc.sendTransaction(sdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE));

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
