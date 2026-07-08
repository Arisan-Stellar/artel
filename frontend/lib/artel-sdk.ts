import * as StellarSdk from "@stellar/stellar-sdk";

// Network config — override via NEXT_PUBLIC_* env vars
// For Vercel: set these in Vercel dashboard → Environment Variables
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "testnet";
export const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || "https://horizon-testnet.stellar.org";
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";

// Smart contract IDs — override via NEXT_PUBLIC_CONTRACT_* env vars
export const CONTRACT_IDS = {
  factory: process.env.NEXT_PUBLIC_CONTRACT_FACTORY || "CCDM7FMETTVS5NO2UOLFNBOYZJTNZLG6QOVONEGJD4YYTVKURAIU6ABE",
  pool: process.env.NEXT_PUBLIC_CONTRACT_POOL || "CDV5Y63JCK3WOU4KFNPXGYDYM3OESNCGWDVN4SZVA45A7IYSIH6Q3ORR",
  vault: process.env.NEXT_PUBLIC_CONTRACT_VAULT || "CCIUQJ3JZJTCJSJQDOW4QLRVT44TL3Y6WIUBW77AWL56AQEYBMOANOAH",
  faucet: process.env.NEXT_PUBLIC_CONTRACT_FAUCET || "CBOLEQIEDW5M4VWDPWLX6M3WGLRSNXBSLBZZ7KJWHT3RUU3XEGX5AYVX",
};

// XLM native token contract
export const XLM_CONTRACT = process.env.NEXT_PUBLIC_XLM_CONTRACT || "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export interface ArisanConfig {
  name: string;
  contribution_amount: string;
  max_members: number;
  collateral_ratio_bps: number;
  token: string;
}

export class ArtelClient {
  private server: StellarSdk.rpc.Server;

  constructor() {
    this.server = new StellarSdk.rpc.Server(RPC_URL, { allowHttp: false });
  }

  getServer() { return this.server; }

  async getArisanState(contractId: string): Promise<StellarSdk.xdr.ScVal | null> {
    try {
      const tx = new StellarSdk.TransactionBuilder(
        new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0"),
        { fee: "1000", networkPassphrase: NETWORK_PASSPHRASE, timebounds: { minTime: 0, maxTime: 0 } }
      );
      const op = StellarSdk.Operation.invokeContractFunction({
        contract: contractId,
        function: "get_state",
        args: [],
      });
      tx.addOperation(op);
      const built = tx.build();
      const sim = await this.server.simulateTransaction(built);
      if (StellarSdk.rpc.Api.isSimulationSuccess(sim)) {
        return sim.result?.retval ?? null;
      }
    } catch { /* ignore */ }
    return null;
  }
}

export const artelClient = new ArtelClient();
