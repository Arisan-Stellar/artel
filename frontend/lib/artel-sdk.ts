import * as StellarSdk from "@stellar/stellar-sdk";

export const NETWORK = "testnet";
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

export const CONTRACT_IDS = {
  pool: "CCPAX3PM3DNMXU4ZGPADUIWNZR4P2CSKRCNQSA4BGS2JU24DXFONBWM3",
  vault: "CDSHKMKFSTQVDDUB3C3USJUOM4MBBYNDF5FMHSLQTOVUMDNXZYZOEBBL",
};

export const XLM_CONTRACT = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

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
