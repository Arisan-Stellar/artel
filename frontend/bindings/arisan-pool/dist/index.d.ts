import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from "@stellar/stellar-sdk/contract";
import type { u32, i32, u64, i128, Option } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export interface Pool {
    active_depositors_count: u32;
    admin: string;
    blend_btoken_balance: i128;
    col_yield_dist: i128;
    collateral_balance: i128;
    collateral_yield_balance: i128;
    config: ArisanConfig;
    current_round: u32;
    end_period_gacha_balance: i128;
    is_full: boolean;
    last_harvest_time: u64;
    member_list: Array<string>;
    members: Map<string, MemberInfo>;
    paused: boolean;
    pool_funds_balance: i128;
    pool_start_time: u64;
    round_start_time: u64;
    round_winners: Map<u32, string>;
    state: ArisanState;
    total_rounds: u32;
    winner_payout_balance: i128;
    yield_balance: i128;
    yield_vault: string;
}
export type GachaTier = {
    tag: "GrandJackpot";
    values: void;
} | {
    tag: "RunnerUp";
    values: void;
} | {
    tag: "Consolation";
    values: void;
};
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
    pending_winner_payout: i128;
    total_contributed: i128;
    total_points: i32;
    winner_payout_claimed: boolean;
    yield_earned: i128;
}
export type ArisanState = {
    tag: "Pending";
    values: void;
} | {
    tag: "Active";
    values: void;
} | {
    tag: "Completed";
    values: void;
};
export interface GachaWinner {
    address: string;
    prize_amount: i128;
    tickets_held: u32;
    tier: GachaTier;
}
export interface PoolSummary {
    active_depositors_count: u32;
    blend_btoken_balance: i128;
    collateral_balance: i128;
    collateral_yield_balance: i128;
    current_round: u32;
    is_full: boolean;
    last_harvest_time: u64;
    member_count: u32;
    paused: boolean;
    pool_funds_balance: i128;
    state: ArisanState;
    total_rounds: u32;
    yield_balance: i128;
}
export interface ArisanConfig {
    admin_fee_bps: u32;
    blend_address: string;
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
    exit: ({ pool_id, member }: {
        pool_id: u32;
        member: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>;
    /**
     * Construct and simulate a join transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    join: ({ pool_id, member }: {
        pool_id: u32;
        member: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<MemberInfo>>>;
    /**
     * Construct and simulate a pause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    pause: ({ pool_id }: {
        pool_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a unpause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    unpause: ({ pool_id }: {
        pool_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_admin: ({ pool_id }: {
        pool_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a get_state transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_state: ({ pool_id }: {
        pool_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<PoolSummary>>;
    /**
     * Construct and simulate a contribute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    contribute: ({ pool_id, member }: {
        pool_id: u32;
        member: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<MemberInfo>>>;
    /**
     * Construct and simulate a get_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_config: ({ pool_id }: {
        pool_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<ArisanConfig>>;
    /**
     * Construct and simulate a start_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    start_pool: ({ pool_id }: {
        pool_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a claim_final transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    claim_final: ({ pool_id, member }: {
        pool_id: u32;
        member: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<readonly [i128, i128]>>>;
    /**
     * Construct and simulate a create_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_pool: ({ admin, yield_vault, config }: {
        admin: string;
        yield_vault: string;
        config: ArisanConfig;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a get_tickets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_tickets: ({ pool_id, member }: {
        pool_id: u32;
        member: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a harvest_yield transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    harvest_yield: ({ pool_id, amount }: {
        pool_id: u32;
        amount: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<YieldDistribution>>>;
    /**
     * Construct and simulate a select_winner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    select_winner: ({ pool_id }: {
        pool_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>;
    /**
     * Construct and simulate a get_pool_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_pool_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a get_leaderboard transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_leaderboard: ({ pool_id }: {
        pool_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Array<readonly [string, u32]>>>;
    /**
     * Construct and simulate a get_member_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_member_info: ({ pool_id, member }: {
        pool_id: u32;
        member: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Option<MemberInfo>>>;
    /**
     * Construct and simulate a get_round_winner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_round_winner: ({ pool_id, round }: {
        pool_id: u32;
        round: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Option<string>>>;
    /**
     * Construct and simulate a slash_collateral transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    slash_collateral: ({ pool_id, defaulter }: {
        pool_id: u32;
        defaulter: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>;
    /**
     * Construct and simulate a claim_winner_payout transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    claim_winner_payout: ({ pool_id, member }: {
        pool_id: u32;
        member: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>;
    /**
     * Construct and simulate a disburse_pool_yield_gacha transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    disburse_pool_yield_gacha: ({ pool_id }: {
        pool_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Array<GachaWinner>>>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        exit: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        join: (json: string) => AssembledTransaction<Result<MemberInfo, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        pause: (json: string) => AssembledTransaction<null>;
        unpause: (json: string) => AssembledTransaction<null>;
        get_admin: (json: string) => AssembledTransaction<string>;
        get_state: (json: string) => AssembledTransaction<PoolSummary>;
        contribute: (json: string) => AssembledTransaction<Result<MemberInfo, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_config: (json: string) => AssembledTransaction<ArisanConfig>;
        start_pool: (json: string) => AssembledTransaction<null>;
        claim_final: (json: string) => AssembledTransaction<Result<readonly [bigint, bigint], import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        create_pool: (json: string) => AssembledTransaction<number>;
        get_tickets: (json: string) => AssembledTransaction<number>;
        harvest_yield: (json: string) => AssembledTransaction<Result<YieldDistribution, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        select_winner: (json: string) => AssembledTransaction<Result<string, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_pool_count: (json: string) => AssembledTransaction<number>;
        get_leaderboard: (json: string) => AssembledTransaction<(readonly [string, number])[]>;
        get_member_info: (json: string) => AssembledTransaction<Option<MemberInfo>>;
        get_round_winner: (json: string) => AssembledTransaction<Option<string>>;
        slash_collateral: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        claim_winner_payout: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        disburse_pool_yield_gacha: (json: string) => AssembledTransaction<Result<GachaWinner[], import("@stellar/stellar-sdk/contract").ErrorMessage>>;
    };
}
