import * as StellarSdk from "@stellar/stellar-sdk";

export const NETWORK = "testnet";
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

export const CONTRACT_IDS = {
  factory: "CCDM7FMETTVS5NO2UOLFNBOYZJTNZLG6QOVONEGJD4YYTVKURAIU6ABE",
  pool: "CD5JAD6VAMI2IR7IKNAX42AL4MFBAZM6ZYE6XBDC6AQZ5MNX6JR6GPH5",
  vault: "CCIUQJ3JZJTCJSJQDOW4QLRVT44TL3Y6WIUBW77AWL56AQEYBMOANOAH",
  faucet: "CBOLEQIEDW5M4VWDPWLX6M3WGLRSNXBSLBZZ7KJWHT3RUU3XEGX5AYVX",
};

export const ARUSDC_TOKEN = "CDIPE45CR3NJ35EISVQAJ55NLM3POKT5Y3SIJQ4RSPE7DK4ZVY3YZ52R";

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

  async getArisanState(contractId: string): Promise<any> {
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
        return sim.result?.retval;
      }
    } catch { /* ignore */ }
    return null;
  }
}

export const artelClient = new ArtelClient();
