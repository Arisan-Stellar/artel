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
    contractId: "CD5JAD6VAMI2IR7IKNAX42AL4MFBAZM6ZYE6XBDC6AQZ5MNX6JR6GPH5",
  }
} as const


export interface Pool {
  active_depositors_count: u32;
  admin: string;
  col_yield_dist: i128;
  collateral_balance: i128;
  collateral_yield_balance: i128;
  config: ArisanConfig;
  current_round: u32;
  is_full: boolean;
  member_list: Array<string>;
  members: Map<string, MemberInfo>;
  paused: boolean;
  pool_funds_balance: i128;
  pool_start_time: u64;
  round_start_time: u64;
  round_winners: Map<u32, string>;
  state: ArisanState;
  total_rounds: u32;
  yield_balance: i128;
  yield_vault: string;
}

export type GachaTier = {tag: "GrandJackpot", values: void} | {tag: "RunnerUp", values: void} | {tag: "Consolation", values: void};


export interface MemberInfo {
  address: string;
  collateral_amount: i128;
  current_streak: u32;
  deposited_this_round: boolean;
  early_payments: u32;
  gacha_claimed: boolean;
  has_won: boolean;
  is_active: boolean;
  joined_at: u64;
  last_deposit_round: u32;
  late_payments: u32;
  mid_payments: u32;
  missed_payments: u32;
  total_contributed: i128;
  total_points: i32;
  winner_payout_claimed: boolean;
  yield_earned: i128;
}

export type ArisanState = {tag: "Pending", values: void} | {tag: "Active", values: void} | {tag: "Completed", values: void};


export interface GachaWinner {
  address: string;
  prize_amount: i128;
  tickets_held: u32;
  tier: GachaTier;
}


export interface PoolSummary {
  active_depositors_count: u32;
  collateral_balance: i128;
  collateral_yield_balance: i128;
  current_round: u32;
  is_full: boolean;
  member_count: u32;
  paused: boolean;
  pool_funds_balance: i128;
  state: ArisanState;
  total_rounds: u32;
  yield_balance: i128;
}


export interface ArisanConfig {
  admin_fee_bps: u32;
  collateral_ratio_bps: u32;
  contribution_amount: i128;
  early_points: u32;
  late_penalty: i32;
  max_members: u32;
  mid_points: u32;
  min_reputation: u32;
  name: string;
  round_duration: u64;
  slash_grace_period: u64;
  token: string;
}


export interface YieldDistribution {
  member_share: i128;
  ops_share: i128;
  per_member_share: i128;
  vault_share: i128;
}

export interface Client {
  /**
   * Construct and simulate a exit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  exit: ({member}: {member: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  init: ({admin, yield_vault, config}: {admin: string, yield_vault: string, config: ArisanConfig}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a join transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  join: ({member}: {member: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<MemberInfo>>>

  /**
   * Construct and simulate a pause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pause: (options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a unpause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unpause: (options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_state transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_state: (options?: MethodOptions) => Promise<AssembledTransaction<PoolSummary>>

  /**
   * Construct and simulate a contribute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  contribute: ({member}: {member: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<MemberInfo>>>

  /**
   * Construct and simulate a start_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  start_pool: (options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a claim_final transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_final: ({member}: {member: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<readonly [i128, i128]>>>

  /**
   * Construct and simulate a get_tickets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_tickets: ({member}: {member: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a deposit_yield transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deposit_yield: ({from_admin, amount}: {from_admin: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a select_winner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  select_winner: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a get_leaderboard transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_leaderboard: (options?: MethodOptions) => Promise<AssembledTransaction<Array<readonly [string, u32]>>>

  /**
   * Construct and simulate a get_member_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_member_info: ({member}: {member: string}, options?: MethodOptions) => Promise<AssembledTransaction<Option<MemberInfo>>>

  /**
   * Construct and simulate a slash_collateral transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  slash_collateral: ({defaulter}: {defaulter: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a disburse_pool_yield_gacha transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  disburse_pool_yield_gacha: (options?: MethodOptions) => Promise<AssembledTransaction<Result<Array<GachaWinner>>>>

  /**
   * Construct and simulate a distribute_collateral_yield transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  distribute_collateral_yield: (options?: MethodOptions) => Promise<AssembledTransaction<Result<YieldDistribution>>>

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
      new ContractSpec([ "AAAAAAAAAAAAAAAEZXhpdAAAAAEAAAAAAAAABm1lbWJlcgAAAAAAEwAAAAEAAAPpAAAACwAAAAM=",
        "AAAAAAAAAAAAAAAEaW5pdAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAALeWllbGRfdmF1bHQAAAAAEwAAAAAAAAAGY29uZmlnAAAAAAfQAAAADEFyaXNhbkNvbmZpZwAAAAA=",
        "AAAAAAAAAAAAAAAEam9pbgAAAAEAAAAAAAAABm1lbWJlcgAAAAAAEwAAAAEAAAPpAAAH0AAAAApNZW1iZXJJbmZvAAAAAAAD",
        "AAAAAAAAAAAAAAAFcGF1c2UAAAAAAAAAAAAAAA==",
        "AAAAAQAAAAAAAAAAAAAABFBvb2wAAAATAAAAAAAAABdhY3RpdmVfZGVwb3NpdG9yc19jb3VudAAAAAAEAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAADmNvbF95aWVsZF9kaXN0AAAAAAALAAAAAAAAABJjb2xsYXRlcmFsX2JhbGFuY2UAAAAAAAsAAAAAAAAAGGNvbGxhdGVyYWxfeWllbGRfYmFsYW5jZQAAAAsAAAAAAAAABmNvbmZpZwAAAAAH0AAAAAxBcmlzYW5Db25maWcAAAAAAAAADWN1cnJlbnRfcm91bmQAAAAAAAAEAAAAAAAAAAdpc19mdWxsAAAAAAEAAAAAAAAAC21lbWJlcl9saXN0AAAAA+oAAAATAAAAAAAAAAdtZW1iZXJzAAAAA+wAAAATAAAH0AAAAApNZW1iZXJJbmZvAAAAAAAAAAAABnBhdXNlZAAAAAAAAQAAAAAAAAAScG9vbF9mdW5kc19iYWxhbmNlAAAAAAALAAAAAAAAAA9wb29sX3N0YXJ0X3RpbWUAAAAABgAAAAAAAAAQcm91bmRfc3RhcnRfdGltZQAAAAYAAAAAAAAADXJvdW5kX3dpbm5lcnMAAAAAAAPsAAAABAAAABMAAAAAAAAABXN0YXRlAAAAAAAH0AAAAAtBcmlzYW5TdGF0ZQAAAAAAAAAADHRvdGFsX3JvdW5kcwAAAAQAAAAAAAAADXlpZWxkX2JhbGFuY2UAAAAAAAALAAAAAAAAAAt5aWVsZF92YXVsdAAAAAAT",
        "AAAAAAAAAAAAAAAHdW5wYXVzZQAAAAAAAAAAAA==",
        "AAAAAAAAAAAAAAAJZ2V0X3N0YXRlAAAAAAAAAAAAAAEAAAfQAAAAC1Bvb2xTdW1tYXJ5AA==",
        "AAAAAAAAAAAAAAAKY29udHJpYnV0ZQAAAAAAAQAAAAAAAAAGbWVtYmVyAAAAAAATAAAAAQAAA+kAAAfQAAAACk1lbWJlckluZm8AAAAAAAM=",
        "AAAAAAAAAAAAAAAKc3RhcnRfcG9vbAAAAAAAAAAAAAA=",
        "AAAAAAAAAAAAAAALY2xhaW1fZmluYWwAAAAAAQAAAAAAAAAGbWVtYmVyAAAAAAATAAAAAQAAA+kAAAPtAAAAAgAAAAsAAAALAAAAAw==",
        "AAAAAAAAAAAAAAALZ2V0X3RpY2tldHMAAAAAAQAAAAAAAAAGbWVtYmVyAAAAAAATAAAAAQAAAAQ=",
        "AAAAAgAAAAAAAAAAAAAACUdhY2hhVGllcgAAAAAAAAMAAAAAAAAAAAAAAAxHcmFuZEphY2twb3QAAAAAAAAAAAAAAAhSdW5uZXJVcAAAAAAAAAAAAAAAC0NvbnNvbGF0aW9uAA==",
        "AAAAAQAAAAAAAAAAAAAACk1lbWJlckluZm8AAAAAABEAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAAAAAARY29sbGF0ZXJhbF9hbW91bnQAAAAAAAALAAAAAAAAAA5jdXJyZW50X3N0cmVhawAAAAAABAAAAAAAAAAUZGVwb3NpdGVkX3RoaXNfcm91bmQAAAABAAAAAAAAAA5lYXJseV9wYXltZW50cwAAAAAABAAAAAAAAAANZ2FjaGFfY2xhaW1lZAAAAAAAAAEAAAAAAAAAB2hhc193b24AAAAAAQAAAAAAAAAJaXNfYWN0aXZlAAAAAAAAAQAAAAAAAAAJam9pbmVkX2F0AAAAAAAABgAAAAAAAAASbGFzdF9kZXBvc2l0X3JvdW5kAAAAAAAEAAAAAAAAAA1sYXRlX3BheW1lbnRzAAAAAAAABAAAAAAAAAAMbWlkX3BheW1lbnRzAAAABAAAAAAAAAAPbWlzc2VkX3BheW1lbnRzAAAAAAQAAAAAAAAAEXRvdGFsX2NvbnRyaWJ1dGVkAAAAAAAACwAAAAAAAAAMdG90YWxfcG9pbnRzAAAABQAAAAAAAAAVd2lubmVyX3BheW91dF9jbGFpbWVkAAAAAAAAAQAAAAAAAAAMeWllbGRfZWFybmVkAAAACw==",
        "AAAAAAAAAAAAAAANZGVwb3NpdF95aWVsZAAAAAAAAAIAAAAAAAAACmZyb21fYWRtaW4AAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAA=",
        "AAAAAAAAAAAAAAANc2VsZWN0X3dpbm5lcgAAAAAAAAAAAAABAAAD6QAAABMAAAAD",
        "AAAAAgAAAAAAAAAAAAAAC0FyaXNhblN0YXRlAAAAAAMAAAAAAAAAAAAAAAdQZW5kaW5nAAAAAAAAAAAAAAAABkFjdGl2ZQAAAAAAAAAAAAAAAAAJQ29tcGxldGVkAAAA",
        "AAAAAQAAAAAAAAAAAAAAC0dhY2hhV2lubmVyAAAAAAQAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAAAAAAMcHJpemVfYW1vdW50AAAACwAAAAAAAAAMdGlja2V0c19oZWxkAAAABAAAAAAAAAAEdGllcgAAB9AAAAAJR2FjaGFUaWVyAAAA",
        "AAAAAQAAAAAAAAAAAAAAC1Bvb2xTdW1tYXJ5AAAAAAsAAAAAAAAAF2FjdGl2ZV9kZXBvc2l0b3JzX2NvdW50AAAAAAQAAAAAAAAAEmNvbGxhdGVyYWxfYmFsYW5jZQAAAAAACwAAAAAAAAAYY29sbGF0ZXJhbF95aWVsZF9iYWxhbmNlAAAACwAAAAAAAAANY3VycmVudF9yb3VuZAAAAAAAAAQAAAAAAAAAB2lzX2Z1bGwAAAAAAQAAAAAAAAAMbWVtYmVyX2NvdW50AAAABAAAAAAAAAAGcGF1c2VkAAAAAAABAAAAAAAAABJwb29sX2Z1bmRzX2JhbGFuY2UAAAAAAAsAAAAAAAAABXN0YXRlAAAAAAAH0AAAAAtBcmlzYW5TdGF0ZQAAAAAAAAAADHRvdGFsX3JvdW5kcwAAAAQAAAAAAAAADXlpZWxkX2JhbGFuY2UAAAAAAAAL",
        "AAAAAQAAAAAAAAAAAAAADEFyaXNhbkNvbmZpZwAAAAwAAAAAAAAADWFkbWluX2ZlZV9icHMAAAAAAAAEAAAAAAAAABRjb2xsYXRlcmFsX3JhdGlvX2JwcwAAAAQAAAAAAAAAE2NvbnRyaWJ1dGlvbl9hbW91bnQAAAAACwAAAAAAAAAMZWFybHlfcG9pbnRzAAAABAAAAAAAAAAMbGF0ZV9wZW5hbHR5AAAABQAAAAAAAAALbWF4X21lbWJlcnMAAAAABAAAAAAAAAAKbWlkX3BvaW50cwAAAAAABAAAAAAAAAAObWluX3JlcHV0YXRpb24AAAAAAAQAAAAAAAAABG5hbWUAAAAQAAAAAAAAAA5yb3VuZF9kdXJhdGlvbgAAAAAABgAAAAAAAAASc2xhc2hfZ3JhY2VfcGVyaW9kAAAAAAAGAAAAAAAAAAV0b2tlbgAAAAAAABM=",
        "AAAAAAAAAAAAAAAPZ2V0X2xlYWRlcmJvYXJkAAAAAAAAAAABAAAD6gAAA+0AAAACAAAAEwAAAAQ=",
        "AAAAAAAAAAAAAAAPZ2V0X21lbWJlcl9pbmZvAAAAAAEAAAAAAAAABm1lbWJlcgAAAAAAEwAAAAEAAAPoAAAH0AAAAApNZW1iZXJJbmZvAAA=",
        "AAAAAAAAAAAAAAAQc2xhc2hfY29sbGF0ZXJhbAAAAAEAAAAAAAAACWRlZmF1bHRlcgAAAAAAABMAAAABAAAD6QAAAAsAAAAD",
        "AAAAAQAAAAAAAAAAAAAAEVlpZWxkRGlzdHJpYnV0aW9uAAAAAAAABAAAAAAAAAAMbWVtYmVyX3NoYXJlAAAACwAAAAAAAAAJb3BzX3NoYXJlAAAAAAAACwAAAAAAAAAQcGVyX21lbWJlcl9zaGFyZQAAAAsAAAAAAAAAC3ZhdWx0X3NoYXJlAAAAAAs=",
        "AAAAAAAAAAAAAAAZZGlzYnVyc2VfcG9vbF95aWVsZF9nYWNoYQAAAAAAAAAAAAABAAAD6QAAA+oAAAfQAAAAC0dhY2hhV2lubmVyAAAAAAM=",
        "AAAAAAAAAAAAAAAbZGlzdHJpYnV0ZV9jb2xsYXRlcmFsX3lpZWxkAAAAAAAAAAABAAAD6QAAB9AAAAARWWllbGREaXN0cmlidXRpb24AAAAAAAAD" ]),
      options
    )
  }
  public readonly fromJSON = {
    exit: this.txFromJSON<Result<i128>>,
        init: this.txFromJSON<null>,
        join: this.txFromJSON<Result<MemberInfo>>,
        pause: this.txFromJSON<null>,
        unpause: this.txFromJSON<null>,
        get_state: this.txFromJSON<PoolSummary>,
        contribute: this.txFromJSON<Result<MemberInfo>>,
        start_pool: this.txFromJSON<null>,
        claim_final: this.txFromJSON<Result<readonly [i128, i128]>>,
        get_tickets: this.txFromJSON<u32>,
        deposit_yield: this.txFromJSON<null>,
        select_winner: this.txFromJSON<Result<string>>,
        get_leaderboard: this.txFromJSON<Array<readonly [string, u32]>>,
        get_member_info: this.txFromJSON<Option<MemberInfo>>,
        slash_collateral: this.txFromJSON<Result<i128>>,
        disburse_pool_yield_gacha: this.txFromJSON<Result<Array<GachaWinner>>>,
        distribute_collateral_yield: this.txFromJSON<Result<YieldDistribution>>
  }
}