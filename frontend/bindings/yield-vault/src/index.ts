import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCIUQJ3JZJTCJSJQDOW4QLRVT44TL3Y6WIUBW77AWL56AQEYBMOANOAH",
  }
} as const

export type VaultKey = {tag: "Admin", values: void} | {tag: "Token", values: void} | {tag: "TotalVaulted", values: void} | {tag: "TotalDistributed", values: void} | {tag: "LastGachaTimestamp", values: void} | {tag: "GachaLocked", values: void} | {tag: "Arisan", values: readonly [u32]} | {tag: "ArisanCount", values: void} | {tag: "Participant", values: readonly [u32]};


export interface GachaWinner {
  address: string;
  prize: i128;
  tickets: u32;
  tier: u32;
}

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  init: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_state transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_state: (options?: MethodOptions) => Promise<AssembledTransaction<readonly [i128, i128, u64, boolean]>>

  /**
   * Construct and simulate a set_token transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_token: ({token_addr}: {token_addr: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a annual_gacha transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  annual_gacha: (options?: MethodOptions) => Promise<AssembledTransaction<Array<GachaWinner>>>

  /**
   * Construct and simulate a receive_yield transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  receive_yield: ({from_arisan, amount}: {from_arisan: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a reset_for_new_year transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  reset_for_new_year: (options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a register_participant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_participant: ({arisan, participant, tickets}: {arisan: string, participant: string, tickets: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAAEaW5pdAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAJZ2V0X3N0YXRlAAAAAAAAAAAAAAEAAAPtAAAABAAAAAsAAAALAAAABgAAAAE=",
        "AAAAAAAAAAAAAAAJc2V0X3Rva2VuAAAAAAAAAQAAAAAAAAAKdG9rZW5fYWRkcgAAAAAAEwAAAAA=",
        "AAAAAgAAAAAAAAAAAAAACFZhdWx0S2V5AAAACQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAFVG9rZW4AAAAAAAAAAAAAAAAAAAxUb3RhbFZhdWx0ZWQAAAAAAAAAAAAAABBUb3RhbERpc3RyaWJ1dGVkAAAAAAAAAAAAAAASTGFzdEdhY2hhVGltZXN0YW1wAAAAAAAAAAAAAAAAAAtHYWNoYUxvY2tlZAAAAAABAAAAAAAAAAZBcmlzYW4AAAAAAAEAAAAEAAAAAAAAAAAAAAALQXJpc2FuQ291bnQAAAAAAQAAAAAAAAALUGFydGljaXBhbnQAAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAAMYW5udWFsX2dhY2hhAAAAAAAAAAEAAAPqAAAH0AAAAAtHYWNoYVdpbm5lcgA=",
        "AAAAAAAAAAAAAAANcmVjZWl2ZV95aWVsZAAAAAAAAAIAAAAAAAAAC2Zyb21fYXJpc2FuAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAA=",
        "AAAAAQAAAAAAAAAAAAAAC0dhY2hhV2lubmVyAAAAAAQAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAAAAAAFcHJpemUAAAAAAAALAAAAAAAAAAd0aWNrZXRzAAAAAAQAAAAAAAAABHRpZXIAAAAE",
        "AAAAAAAAAAAAAAAScmVzZXRfZm9yX25ld195ZWFyAAAAAAAAAAAAAA==",
        "AAAAAAAAAAAAAAAUcmVnaXN0ZXJfcGFydGljaXBhbnQAAAADAAAAAAAAAAZhcmlzYW4AAAAAABMAAAAAAAAAC3BhcnRpY2lwYW50AAAAABMAAAAAAAAAB3RpY2tldHMAAAAABAAAAAA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<null>,
        get_state: this.txFromJSON<readonly [i128, i128, u64, boolean]>,
        set_token: this.txFromJSON<null>,
        annual_gacha: this.txFromJSON<Array<GachaWinner>>,
        receive_yield: this.txFromJSON<null>,
        reset_for_new_year: this.txFromJSON<null>,
        register_participant: this.txFromJSON<null>
  }
}