"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

type WalletType = "freighter" | "albedo" | "xbull" | "lobstr" | "none";

interface WalletCtx {
  address: string | null;
  walletType: WalletType;
  connecting: boolean;
  connect: (type?: WalletType) => Promise<void>;
  disconnect: () => void;
}

const WALLET_LABELS: Record<WalletType, string> = {
  freighter: "Freighter", albedo: "Albedo", xbull: "xBull", lobstr: "Lobstr", none: "None",
};
export const getWalletLabel = (t: WalletType) => WALLET_LABELS[t];

const WalletContext = createContext<WalletCtx>({
  address: null, walletType: "none", connecting: false, connect: async () => {}, disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>("none");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const mod = await import("@stellar/freighter-api");
        if ((await mod.isConnected())?.isConnected) {
          const { address: addr } = await mod.getAddress();
          if (addr) { setAddress(addr); setWalletType("freighter"); }
        }
      } catch {}
    })();
  }, []);

  const connect = useCallback(async (type: WalletType = "freighter") => {
    setConnecting(true);
    try {
      if (type === "freighter") {
        const mod = await import("@stellar/freighter-api");
        if (!(await mod.isConnected())?.isConnected) throw new Error("Freighter not detected");
        await mod.requestAccess();
        const { address: addr } = await mod.getAddress();
        if (addr) { setAddress(addr); setWalletType("freighter"); }
      } else if (type === "albedo") {
        const albedo = (await import("@albedo-link/intent")).default;
        const res = await albedo.publicKey({});
        if (res.pubkey) { setAddress(res.pubkey); setWalletType("albedo"); }
      } else if (type === "xbull") {
        const mod = await import("@creit.tech/xbull-wallet-connect");
        const bridge = new mod.xBullWalletConnect();
        const pubkey = await bridge.connect();
        if (pubkey) { setAddress(pubkey); setWalletType("xbull"); }
      } else if (type === "lobstr") {
        const { getPublicKey } = await import("@lobstrco/signer-extension-api");
        const pubkey = await getPublicKey();
        if (pubkey) { setAddress(pubkey); setWalletType("lobstr"); }
      }
    } catch (e: any) {
      console.error(`Connect ${type}:`, e?.message || e);
    }
    setConnecting(false);
  }, []);

  const disconnect = useCallback(() => { setAddress(null); setWalletType("none"); }, []);

  return (
    <WalletContext.Provider value={{ address, walletType, connecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
