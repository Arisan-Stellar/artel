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
    contractId: "CCDM7FMETTVS5NO2UOLFNBOYZJTNZLG6QOVONEGJD4YYTVKURAIU6ABE",
  }
} as const


export interface PoolEntry {
  admin: string;
  contract_id: string;
  contribution_amount: i128;
  current_members: u32;
  max_members: u32;
  name: string;
  state: u32;
}


export interface FactoryAdmin {
  address: string;
}

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  init: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_pools transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pools: (options?: MethodOptions) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a register_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_pool: ({pool_address, deployer, name, contribution, max_members}: {pool_address: string, deployer: string, name: string, contribution: i128, max_members: u32}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_pool_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pool_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_pool_by_index transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pool_by_index: ({index}: {index: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Option<string>>>

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
        "AAAAAAAAAAAAAAAJZ2V0X3Bvb2xzAAAAAAAAAAAAAAEAAAPqAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAACVBvb2xFbnRyeQAAAAAAAAcAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAALY29udHJhY3RfaWQAAAAAEwAAAAAAAAATY29udHJpYnV0aW9uX2Ftb3VudAAAAAALAAAAAAAAAA9jdXJyZW50X21lbWJlcnMAAAAABAAAAAAAAAALbWF4X21lbWJlcnMAAAAABAAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXN0YXRlAAAAAAAABA==",
        "AAAAAAAAAAAAAAANcmVnaXN0ZXJfcG9vbAAAAAAAAAUAAAAAAAAADHBvb2xfYWRkcmVzcwAAABMAAAAAAAAACGRlcGxveWVyAAAAEwAAAAAAAAAEbmFtZQAAABAAAAAAAAAADGNvbnRyaWJ1dGlvbgAAAAsAAAAAAAAAC21heF9tZW1iZXJzAAAAAAQAAAABAAAABA==",
        "AAAAAAAAAAAAAAAOZ2V0X3Bvb2xfY291bnQAAAAAAAAAAAABAAAABA==",
        "AAAAAQAAAAAAAAAAAAAADEZhY3RvcnlBZG1pbgAAAAEAAAAAAAAAB2FkZHJlc3MAAAAAEw==",
        "AAAAAAAAAAAAAAARZ2V0X3Bvb2xfYnlfaW5kZXgAAAAAAAABAAAAAAAAAAVpbmRleAAAAAAAAAQAAAABAAAD6AAAABM=" ]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<null>,
        get_pools: this.txFromJSON<Array<string>>,
        register_pool: this.txFromJSON<u32>,
        get_pool_count: this.txFromJSON<u32>,
        get_pool_by_index: this.txFromJSON<Option<string>>
  }
}