import * as StellarSdk from "@stellar/stellar-sdk";

// Network config — override via NEXT_PUBLIC_* env vars
// For Vercel: set these in Vercel dashboard → Environment Variables
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "testnet";
export const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || "https://horizon-testnet.stellar.org";
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";

// Smart contract IDs — override via NEXT_PUBLIC_CONTRACT_* env vars
export const CONTRACT_IDS = {
  // Active arisan contract (audited + redeployed with fixes)
  pool: process.env.NEXT_PUBLIC_CONTRACT_POOL || "CBDJOVCVXHMMBP7E7IPBPTZHCKFB277R7QXBEDSIGCNZHYI3VYCOSO5O",
  // Active yield-vault (init + set_token done)
  vault: process.env.NEXT_PUBLIC_CONTRACT_VAULT || "CAW77FMNIHKNCPU6WTFCA7VF42WS3JU5DUXBKZWELGARJ5E6DMYNFW5V",
  // Blend lending pool address (supply/withdraw collateral for yield)
  blend: process.env.NEXT_PUBLIC_CONTRACT_BLEND || "",
};

// XLM native token contract
export const XLM_CONTRACT = process.env.NEXT_PUBLIC_XLM_CONTRACT || "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
export const ARUSDC_TOKEN = process.env.NEXT_PUBLIC_ARUSDC_TOKEN || "CDIPE45CR3NJ35EISVQAJ55NLM3POKT5Y3SIJQ4RSPE7DK4ZVY3YZ52R";

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

  async getArisanState(contractId: string, poolId: number = 0): Promise<StellarSdk.xdr.ScVal | null> {
    try {
      const tx = new StellarSdk.TransactionBuilder(
        new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0"),
        { fee: "1000", networkPassphrase: NETWORK_PASSPHRASE, timebounds: { minTime: 0, maxTime: 0 } }
      );
      const op = StellarSdk.Operation.invokeContractFunction({
        contract: contractId,
        function: "get_state",
        args: [StellarSdk.nativeToScVal(poolId, { type: "u32" })],
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
