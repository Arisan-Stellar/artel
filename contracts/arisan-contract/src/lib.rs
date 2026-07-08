#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, IntoVal, Map, String, Vec, token};

const DAY: u64 = 86400;
const EARLY_WINDOW: u64 = DAY * 10;
const MID_WINDOW: u64 = DAY * 20;
const YIELD_VAULT_SHARE_BPS: i128 = 4000;

#[rustfmt::skip]
#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub enum ArisanState { Pending, Active, Completed }

#[rustfmt::skip]
#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct ArisanConfig {
    pub name: String,
    pub contribution_amount: i128,
    pub collateral_ratio_bps: u32,
    pub token: Address,
    pub max_members: u32,
    pub round_duration: u64,
    pub slash_grace_period: u64,
    pub min_reputation: u32,
    pub admin_fee_bps: u32,
    pub early_points: u32,
    pub mid_points: u32,
    pub late_penalty: i32,
    pub blend_address: Address,
}

#[rustfmt::skip]
#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct MemberInfo {
    pub address: Address,
    pub collateral_amount: i128,
    pub total_contributed: i128,
    pub missed_payments: u32,
    pub has_won: bool,
    pub is_active: bool,
    pub joined_at: u64,
    pub last_deposit_round: u32,
    pub deposited_this_round: bool,
    pub early_payments: u32,
    pub mid_payments: u32,
    pub late_payments: u32,
    pub total_points: i32,
    pub current_streak: u32,
    pub yield_earned: i128,
    pub gacha_claimed: bool,
    pub winner_payout_claimed: bool,
}

#[rustfmt::skip]
#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct Pool {
    pub config: ArisanConfig,
    pub admin: Address,
    pub yield_vault: Address,
    pub state: ArisanState,
    pub current_round: u32,
    pub total_rounds: u32,
    pub round_start_time: u64,
    pub pool_start_time: u64,
    pub is_full: bool,
    pub members: Map<Address, MemberInfo>,
    pub member_list: Vec<Address>,
    pub active_depositors_count: u32,
    pub round_winners: Map<u32, Address>,
    pub collateral_balance: i128,
    pub pool_funds_balance: i128,
    pub yield_balance: i128,
    pub collateral_yield_balance: i128,
    pub col_yield_dist: i128,
    pub paused: bool,
    pub blend_btoken_balance: i128,
    pub end_period_gacha_balance: i128,
}

#[rustfmt::skip]
#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct YieldDistribution {
    pub ops_share: i128,
    pub member_share: i128,
    pub vault_share: i128,
    pub per_member_share: i128,
}

#[rustfmt::skip]
#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub enum GachaTier { GrandJackpot, RunnerUp, Consolation }

#[rustfmt::skip]
#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct GachaWinner {
    pub address: Address,
    pub tier: GachaTier,
    pub tickets_held: u32,
    pub prize_amount: i128,
}

fn validate_config(config: &ArisanConfig) {
    assert!(config.max_members >= 2, "need at least 2 members");
    assert!(config.contribution_amount > 0, "contribution must be positive");
    assert!(config.collateral_ratio_bps >= 10000, "collateral ratio >= 100%");
    assert!(config.round_duration > 0, "round duration must be positive");
    assert!(config.slash_grace_period <= config.round_duration, "slash period <= round duration");
}

fn required_collateral(config: &ArisanConfig) -> i128 {
    (config.contribution_amount
        * (config.max_members as i128 - 1)
        * config.collateral_ratio_bps as i128)
        / 10000
}

fn derive_seed(env: &Env, salt: u64) -> u64 {
    let ledger = env.ledger();
    (ledger.sequence() as u64)
        .wrapping_mul(ledger.timestamp())
        .wrapping_add(salt)
        .wrapping_add(env.storage().instance().get(&symbol_short!("n")).unwrap_or(0u64))
}

fn bump_entropy_counter(env: &Env) {
    let n: u64 = env.storage().instance().get(&symbol_short!("n")).unwrap_or(0);
    env.storage().instance().set(&symbol_short!("n"), &n.wrapping_add(1));
}

fn weighted_random_index(env: &Env, weights: &Vec<u32>, salt: u64) -> u32 {
    let total: u32 = weights.iter().sum();
    if total == 0 { return 0; }
    let seed = derive_seed(env, salt);
    bump_entropy_counter(env);
    let roll = seed % (total as u64);
    let mut cumulative: u32 = 0;
    for (i, w) in weights.iter().enumerate() {
        cumulative = cumulative.saturating_add(w);
        if roll < cumulative as u64 { return i as u32; }
    }
    (weights.len().saturating_sub(1)) as u32
}

fn transfer_from(env: &Env, token_addr: &Address, from: &Address, to: &Address, amount: i128) {
    let tk = token::Client::new(env, token_addr);
    tk.transfer(from, to, &amount);
}

fn blend_supply(env: &Env, blend_addr: &Address, token_addr: &Address, from: &Address, amount: i128) {
    // Cross-contract call to Blend Protocol (Commented out for mock deployment)
    /*
    env.invoke_contract::<soroban_sdk::Val>(
        blend_addr,
        &soroban_sdk::Symbol::new(env, "supply"),
        soroban_sdk::vec![env, token_addr.to_val(), from.to_val(), amount.into_val(env)],
    );
    */
}

fn blend_withdraw(env: &Env, blend_addr: &Address, token_addr: &Address, to: &Address, amount: i128) {
    // Cross-contract call to Blend Protocol (Commented out for mock deployment)
    /*
    env.invoke_contract::<soroban_sdk::Val>(
        blend_addr,
        &soroban_sdk::Symbol::new(env, "withdraw"),
        soroban_sdk::vec![env, token_addr.to_val(), to.to_val(), amount.into_val(env)],
    );
    */
}

fn get_now(env: &Env) -> u64 { env.ledger().timestamp() }
fn contract_id(env: &Env) -> Address { env.current_contract_address() }

fn seconds_since_round_start(env: &Env, round_start: u64) -> u64 {
    get_now(env).saturating_sub(round_start)
}

fn compute_tickets(info: &MemberInfo) -> u32 {
    let base = info.early_payments.saturating_mul(3).saturating_add(info.mid_payments);
    let streak_multiplier = match info.current_streak {
        0..=2   => 100,
        3..=4   => 110,
        5..=7   => 150,
        8..=10  => 180,
        _       => 200,
    };
    1 + (base.saturating_mul(streak_multiplier) / 100)
}

#[contract]
pub struct ArisanContract;

#[contractimpl]
impl ArisanContract {
    pub fn init(env: Env, admin: Address, yield_vault: Address, config: ArisanConfig) {
        admin.require_auth();
        validate_config(&config);

        let pool = Pool {
            config: config.clone(),
            admin: admin.clone(),
            yield_vault,
            state: ArisanState::Pending,
            current_round: 0,
            total_rounds: config.max_members,
            round_start_time: 0,
            pool_start_time: 0,
            is_full: false,
            members: Map::new(&env),
            member_list: Vec::new(&env),
            active_depositors_count: 0,
            round_winners: Map::new(&env),
            collateral_balance: 0,
            pool_funds_balance: 0,
            yield_balance: 0,
            collateral_yield_balance: 0,
            col_yield_dist: 0,
            paused: false,
            blend_btoken_balance: 0,
            end_period_gacha_balance: 0,
        };

        env.storage().instance().set(&symbol_short!("n"), &0u64);
        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        env.events().publish((symbol_short!("init"),), admin);
    }

    // -----------------------------------------------------------------------
    // JOIN — member deposits collateral + transfers tokens to contract
    // -----------------------------------------------------------------------
    pub fn join(env: Env, member: Address) -> Result<MemberInfo, soroban_sdk::Error> {
        member.require_auth();
        let mut pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        assert!(!pool.paused, "pool is paused");
        assert_eq!(pool.state, ArisanState::Pending, "pool not accepting members");
        assert!(!pool.members.contains_key(member.clone()), "already a member");
        assert!((pool.member_list.len() as u32) < pool.config.max_members, "pool is full");

        let collateral = required_collateral(&pool.config);
        let ct = contract_id(&env);

        transfer_from(&env, &pool.config.token, &member, &ct, collateral);
        blend_supply(&env, &pool.config.blend_address, &pool.config.token, &ct, collateral);
        pool.blend_btoken_balance = pool.blend_btoken_balance.saturating_add(collateral);

        pool.collateral_balance = pool.collateral_balance.saturating_add(collateral);

        let info = MemberInfo {
            address: member.clone(),
            collateral_amount: collateral,
            total_contributed: 0,
            missed_payments: 0,
            has_won: false,
            is_active: true,
            joined_at: get_now(&env),
            last_deposit_round: 0,
            deposited_this_round: false,
            early_payments: 0,
            mid_payments: 0,
            late_payments: 0,
            total_points: 10,
            current_streak: 0,
            yield_earned: 0,
            gacha_claimed: false,
            winner_payout_claimed: false,
        };

        pool.members.set(member.clone(), info.clone());
        pool.member_list.push_back(member.clone());
        pool.active_depositors_count = pool.member_list.len();

        if pool.member_list.len() == pool.config.max_members as u32 {
            pool.is_full = true;
        }

        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        env.events().publish((symbol_short!("memjoin"), collateral), member);
        Ok(info)
    }

    // -----------------------------------------------------------------------
    // EXIT — leave pool before it starts (returns collateral)
    // -----------------------------------------------------------------------
    pub fn exit(env: Env, member: Address) -> Result<i128, soroban_sdk::Error> {
        member.require_auth();
        let mut pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        assert_eq!(pool.state, ArisanState::Pending, "can only exit before pool starts");

        let info = pool.members.get(member.clone()).unwrap();
        let refund = info.collateral_amount;

        let ct = contract_id(&env);
        transfer_from(&env, &pool.config.token, &ct, &member, refund);

        pool.members.remove(member.clone());
        pool.collateral_balance = pool.collateral_balance.saturating_sub(refund);

        let mut new_list = Vec::new(&env);
        for m in pool.member_list.iter() {
            if m != member { new_list.push_back(m); }
        }
        pool.member_list = new_list;
        pool.active_depositors_count = pool.member_list.len();
        pool.is_full = pool.member_list.len() == pool.config.max_members as u32;

        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        env.events().publish((symbol_short!("memexit"), refund), member);
        Ok(refund)
    }

    // -----------------------------------------------------------------------
    // START — admin starts the pool
    // -----------------------------------------------------------------------
    pub fn start_pool(env: Env) {
        let mut pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        pool.admin.require_auth();
        assert!(pool.is_full, "pool not full");
        assert_eq!(pool.state, ArisanState::Pending, "already started");

        pool.state = ArisanState::Active;
        pool.current_round = 1;
        pool.round_start_time = get_now(&env);
        pool.pool_start_time = get_now(&env);
        pool.active_depositors_count = pool.member_list.len();

        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        env.events().publish((symbol_short!("poolstart"), pool.current_round), pool.admin);
    }

    // -----------------------------------------------------------------------
    // CONTRIBUTE — pay monthly dues + earn points based on timing
    // -----------------------------------------------------------------------
    pub fn contribute(env: Env, member: Address) -> Result<MemberInfo, soroban_sdk::Error> {
        member.require_auth();
        let mut pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        assert!(!pool.paused, "pool is paused");
        assert_eq!(pool.state, ArisanState::Active, "pool not active");

        let mut info = pool.members.get(member.clone()).unwrap();
        assert!(info.is_active, "member is not active");
        assert!(!info.has_won, "winner cannot contribute again");
        assert!(!info.deposited_this_round, "already deposited this round");

        let elapsed = seconds_since_round_start(&env, pool.round_start_time);
        let contribution = pool.config.contribution_amount;

        if elapsed <= EARLY_WINDOW {
            info.early_payments = info.early_payments.saturating_add(1);
            info.total_points = info.total_points.saturating_add(pool.config.early_points as i32);
            info.current_streak = info.current_streak.saturating_add(1);
        } else if elapsed <= MID_WINDOW {
            info.mid_payments = info.mid_payments.saturating_add(1);
            info.total_points = info.total_points.saturating_add(pool.config.mid_points as i32);
            info.current_streak = 0;
        } else {
            info.late_payments = info.late_payments.saturating_add(1);
            info.total_points = info.total_points.saturating_add(pool.config.late_penalty);
            info.current_streak = 0;
        }

        let ct = contract_id(&env);
        transfer_from(&env, &pool.config.token, &member, &ct, contribution);
        blend_supply(&env, &pool.config.blend_address, &pool.config.token, &ct, contribution);
        pool.blend_btoken_balance = pool.blend_btoken_balance.saturating_add(contribution);

        info.total_contributed = info.total_contributed.saturating_add(contribution);
        info.deposited_this_round = true;
        info.last_deposit_round = pool.current_round;
        pool.pool_funds_balance = pool.pool_funds_balance.saturating_add(contribution);
        pool.active_depositors_count = pool.active_depositors_count.saturating_add(1);

        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        env.events().publish((symbol_short!("contrib"), contribution), member.clone());
        Ok(info)
    }

    // -----------------------------------------------------------------------
    // SLASH — admin-only: slash defaulter's collateral after grace period
    // -----------------------------------------------------------------------
    pub fn slash_collateral(env: Env, defaulter: Address) -> Result<i128, soroban_sdk::Error> {
        let mut pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        pool.admin.require_auth();
        assert_eq!(pool.state, ArisanState::Active, "pool not active");

        let deadline = pool.round_start_time.saturating_add(pool.config.slash_grace_period);
        assert!(get_now(&env) > deadline, "slash period not reached");

        let mut info = pool.members.get(defaulter.clone()).unwrap();
        assert!(!info.deposited_this_round, "member already deposited");
        assert!(info.is_active, "member not active");

        let slash_amount = pool.config.contribution_amount.min(info.collateral_amount);

        if slash_amount >= pool.config.contribution_amount {
            info.deposited_this_round = true;
            info.total_contributed = info.total_contributed.saturating_add(pool.config.contribution_amount);
            pool.pool_funds_balance = pool.pool_funds_balance.saturating_add(pool.config.contribution_amount);
            info.collateral_amount = info.collateral_amount.saturating_sub(slash_amount);
            info.missed_payments = info.missed_payments.saturating_add(1);
            info.total_points = info.total_points.saturating_add(pool.config.late_penalty);
            info.late_payments = info.late_payments.saturating_add(1);
            info.current_streak = 0;
            pool.active_depositors_count = pool.active_depositors_count.saturating_add(1);
        } else {
            pool.yield_balance = pool.yield_balance.saturating_add(slash_amount);
            info.collateral_amount = 0;
            info.is_active = false;
            pool.active_depositors_count = pool.active_depositors_count.saturating_sub(1);
        }

        pool.collateral_balance = pool.collateral_balance.saturating_sub(slash_amount);
        pool.members.set(defaulter.clone(), info);

        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        if slash_amount > 0 {
            env.events().publish((symbol_short!("slashed"), slash_amount), defaulter);
        }
        Ok(slash_amount)
    }

    // -----------------------------------------------------------------------
    // SELECT WINNER — all deposited? pick random winner + transfer pool
    // -----------------------------------------------------------------------
    pub fn select_winner(env: Env) -> Result<Address, soroban_sdk::Error> {
        let mut pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        pool.admin.require_auth();
        assert_eq!(pool.state, ArisanState::Active, "pool not active");

        let expected = pool.member_list.iter()
            .filter(|a| {
                pool.members.get(a.clone()).map(|m| m.is_active).unwrap_or(false)
            })
            .count() as u32;
        assert!(pool.active_depositors_count >= expected,
            "not all active members have deposited");

        let members: Vec<Address> = pool.member_list.clone();
        let mut weights = Vec::new(&env);
        for maddr in members.iter() {
            let info = pool.members.get(maddr.clone()).unwrap();
            if info.is_active && !info.has_won && info.deposited_this_round {
                weights.push_back(1);
            } else {
                weights.push_back(0);
            }
        }

        let idx = weighted_random_index(&env, &weights, 0x4359434C4531) as u32;
        let winner = members.get(idx).unwrap();

        let payout = pool.pool_funds_balance;
        pool.pool_funds_balance = 0;

        let ct = contract_id(&env);
        blend_withdraw(&env, &pool.config.blend_address, &pool.config.token, &ct, payout);
        pool.blend_btoken_balance = pool.blend_btoken_balance.saturating_sub(payout);
        transfer_from(&env, &pool.config.token, &ct, &winner, payout);

        let mut winfo = pool.members.get(winner.clone()).unwrap();
        winfo.has_won = true;
        pool.members.set(winner.clone(), winfo);

        pool.round_winners.set(pool.current_round, winner.clone());
        pool.current_round = pool.current_round.saturating_add(1);
        pool.round_start_time = get_now(&env);
        pool.active_depositors_count = 0;

        for maddr in members.iter() {
            if pool.members.contains_key(maddr.clone()) {
                let mut mi = pool.members.get(maddr.clone()).unwrap();
                mi.deposited_this_round = false;
                pool.members.set(maddr, mi);
            }
        }

        if pool.current_round >= pool.total_rounds {
            pool.state = ArisanState::Completed;
        }

        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        env.events().publish((symbol_short!("winsel"), payout), winner.clone());
        Ok(winner)
    }

    // -----------------------------------------------------------------------
    // DISTRIBUTE COLLATERAL YIELD — 10% ops / 50% members / 40% vault
    // -----------------------------------------------------------------------
    pub fn distribute_collateral_yield(env: Env) -> Result<YieldDistribution, soroban_sdk::Error> {
        let mut pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        pool.admin.require_auth();

        let balance_before = pool.collateral_yield_balance;
        let total_yield = pool.collateral_balance.saturating_sub(balance_before);
        assert!(total_yield > 0, "no new yield to distribute");

        let member_share = total_yield.saturating_mul(75) / 100;
        let end_period_gacha = total_yield - member_share;
        pool.yield_balance = pool.yield_balance.saturating_add(end_period_gacha);

        let active_count = pool.member_list.iter()
            .filter(|a| pool.members.get(a.clone()).map(|m| m.is_active).unwrap_or(false))
            .count() as i128;

        let per_member_final = if active_count > 0 {
            member_share / active_count
        } else { 0 };

        for maddr in pool.member_list.iter() {
            if let Some(mut mi) = pool.members.get(maddr.clone()) {
                if mi.is_active {
                    mi.yield_earned = mi.yield_earned.saturating_add(per_member_final);
                    pool.members.set(maddr, mi);
                }
            }
        }

        pool.collateral_yield_balance = pool.collateral_balance;
        pool.col_yield_dist = pool.col_yield_dist.saturating_add(total_yield);

        let dist = YieldDistribution {
            ops_share: 0,
            member_share,
            vault_share: 0,
            per_member_share: per_member_final,
        };

        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        env.events().publish((symbol_short!("colyield"), total_yield), dist.clone());
        Ok(dist)
    }

    // -----------------------------------------------------------------------
    // GACHA POOL YIELD — weighted lottery at pool end, fixed runner-up dedup
    // -----------------------------------------------------------------------
    pub fn disburse_pool_yield_gacha(env: Env) -> Result<Vec<GachaWinner>, soroban_sdk::Error> {
        let mut pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        assert_eq!(pool.state, ArisanState::Completed, "pool not completed");

        let total_yield = pool.yield_balance;
        assert!(total_yield > 0, "no yield to distribute");

        let grand_prize = total_yield.saturating_mul(50) / 100;
        let runner_total = total_yield.saturating_mul(30) / 100;
        let runner_each = runner_total / 2;
        let consolation_total = total_yield - grand_prize - runner_total;

        let mut participants: Vec<Address> = Vec::new(&env);
        let mut weights_list: Vec<u32> = Vec::new(&env);
        let mut ticket_map: Vec<(Address, u32)> = Vec::new(&env);

        for maddr in pool.member_list.iter() {
            if let Some(info) = pool.members.get(maddr.clone()) {
                if info.is_active {
                    let tix = compute_tickets(&info);
                    participants.push_back(maddr.clone());
                    weights_list.push_back(tix);
                    ticket_map.push_back((maddr, tix));
                }
            }
        }

        let mut winners: Vec<GachaWinner> = Vec::new(&env);
        if participants.is_empty() {
            pool.yield_balance = 0;
            env.storage().persistent().set(&symbol_short!("pool"), &pool);
            return Ok(winners);
        }

        // Grand Jackpot
        let gidx = weighted_random_index(&env, &weights_list, 0x4A434B504F54);
        let grand_addr = participants.get(gidx).unwrap();
        let grand_tix = weights_list.get(gidx).unwrap_or(0);
        winners.push_back(GachaWinner {
            address: grand_addr.clone(),
            tier: GachaTier::GrandJackpot,
            tickets_held: grand_tix,
            prize_amount: grand_prize,
        });

        let mut exclude: Vec<u32> = Vec::from_array(&env, [gidx as u32]);
        let saltr = 0x52554E4E4552; // "RUNNER"

        // Runner-up 1
        if participants.len() >= 2 {
            let r1_idx = weighted_random_index(&env, &weights_list, saltr);
            if r1_idx != gidx as u32 || participants.len() > 2 {
                if !exclude.contains(&r1_idx) {
                    let addr = participants.get(r1_idx).unwrap();
                    winners.push_back(GachaWinner {
                        address: addr.clone(),
                        tier: GachaTier::RunnerUp,
                        tickets_held: weights_list.get(r1_idx).unwrap_or(0),
                        prize_amount: runner_each,
                    });
                    exclude.push_back(r1_idx);
                }
            }
        }

        // Runner-up 2 — different seed, skip already selected
        if participants.len() >= 3 {
            let r2_idx = weighted_random_index(&env, &weights_list, saltr.wrapping_mul(7919));
            if !exclude.contains(&r2_idx) {
                let addr = participants.get(r2_idx).unwrap();
                winners.push_back(GachaWinner {
                    address: addr.clone(),
                    tier: GachaTier::RunnerUp,
                    tickets_held: weights_list.get(r2_idx).unwrap_or(0),
                    prize_amount: runner_each,
                });
                exclude.push_back(r2_idx);
            }
        }

        // Consolation
        let consolation_count = participants.len().saturating_sub(exclude.len()) as i128;
        if consolation_count > 0 && consolation_total > 0 {
            let per_person = consolation_total / consolation_count;
            for (i, p) in participants.iter().enumerate() {
                if !exclude.contains(&(i as u32)) {
                    winners.push_back(GachaWinner {
                        address: p.clone(),
                        tier: GachaTier::Consolation,
                        tickets_held: weights_list.get(i as u32).unwrap_or(0),
                        prize_amount: per_person,
                    });
                }
            }
        }

        let ct = contract_id(&env);
        for w in winners.iter() {
            blend_withdraw(&env, &pool.config.blend_address, &pool.config.token, &ct, w.prize_amount);
            pool.blend_btoken_balance = pool.blend_btoken_balance.saturating_sub(w.prize_amount);
            transfer_from(&env, &pool.config.token, &ct, &w.address, w.prize_amount);
        }

        pool.yield_balance = 0;
        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        env.events().publish((symbol_short!("gachadone"), total_yield), ());
        Ok(winners)
    }

    // -----------------------------------------------------------------------
    // CLAIM FINAL — return collateral + proportional yield after pool ends
    // -----------------------------------------------------------------------
    pub fn claim_final(env: Env, member: Address) -> Result<(i128, i128), soroban_sdk::Error> {
        member.require_auth();
        let mut pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        assert_eq!(pool.state, ArisanState::Completed, "pool not completed");

        let mut info = pool.members.get(member.clone()).unwrap();
        assert!(info.is_active, "member not active");
        assert!(!info.gacha_claimed, "already claimed");

        let collateral_return = info.collateral_amount;
        let yield_return = info.yield_earned;
        let total = collateral_return.saturating_add(yield_return);

        let ct = contract_id(&env);
        blend_withdraw(&env, &pool.config.blend_address, &pool.config.token, &ct, total);
        pool.blend_btoken_balance = pool.blend_btoken_balance.saturating_sub(total);
        transfer_from(&env, &pool.config.token, &ct, &member, total);

        info.gacha_claimed = true;
        info.collateral_amount = 0;
        info.yield_earned = 0;
        pool.collateral_balance = pool.collateral_balance.saturating_sub(collateral_return);

        pool.members.set(member.clone(), info);
        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        env.events().publish((symbol_short!("finclaim"), total), member);
        Ok((collateral_return, yield_return))
    }

    // ---- ADMIN CONTROLS ----

    pub fn deposit_yield(env: Env, from_admin: Address, amount: i128) {
        let mut pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        pool.admin.require_auth();
        let ct = contract_id(&env);
        transfer_from(&env, &pool.config.token, &from_admin, &ct, amount);
        pool.yield_balance = pool.yield_balance.saturating_add(amount);
        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        env.events().publish((symbol_short!("yldep"), amount), from_admin);
    }

    pub fn pause(env: Env) {
        let mut pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        pool.admin.require_auth();
        pool.paused = true;
        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        env.events().publish((symbol_short!("paused"),), pool.admin);
    }

    pub fn unpause(env: Env) {
        let mut pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        pool.admin.require_auth();
        pool.paused = false;
        env.storage().persistent().set(&symbol_short!("pool"), &pool);
        env.events().publish((symbol_short!("unpaused"),), pool.admin);
    }

    // ---- VIEWS ----

    pub fn get_state(env: Env) -> PoolSummary {
        let pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        PoolSummary {
            state: pool.state.clone(),
            current_round: pool.current_round,
            total_rounds: pool.total_rounds,
            is_full: pool.is_full,
            member_count: pool.member_list.len(),
            active_depositors_count: pool.active_depositors_count,
            collateral_balance: pool.collateral_balance,
            pool_funds_balance: pool.pool_funds_balance,
            yield_balance: pool.yield_balance,
            collateral_yield_balance: pool.collateral_yield_balance,
            paused: pool.paused,
            blend_btoken_balance: pool.blend_btoken_balance,
        }
    }

    pub fn get_member_info(env: Env, member: Address) -> Option<MemberInfo> {
        let pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        pool.members.get(member)
    }

    pub fn get_tickets(env: Env, member: Address) -> u32 {
        let pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        if let Some(info) = pool.members.get(member) {
            if info.is_active { return compute_tickets(&info); }
        }
        0
    }

    pub fn get_leaderboard(env: Env) -> Vec<(Address, u32)> {
        let pool: Pool = env.storage().persistent().get(&symbol_short!("pool")).unwrap();
        let mut result = Vec::new(&env);
        for maddr in pool.member_list.iter() {
            if let Some(info) = pool.members.get(maddr.clone()) {
                result.push_back((maddr, compute_tickets(&info)));
            }
        }
        result
    }
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct PoolSummary {
    pub state: ArisanState,
    pub current_round: u32,
    pub total_rounds: u32,
    pub is_full: bool,
    pub member_count: u32,
    pub active_depositors_count: u32,
    pub collateral_balance: i128,
    pub pool_funds_balance: i128,
    pub yield_balance: i128,
    pub collateral_yield_balance: i128,
    pub paused: bool,
    pub blend_btoken_balance: i128,
}

// ---------------------------------------------------------------------------
// TESTS
// ---------------------------------------------------------------------------
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::String;
    use soroban_sdk::testutils::{Address as _, Ledger as _};
    use soroban_sdk::token::StellarAssetClient;

    fn deploy_token(env: &Env, admin: &Address) -> Address {
        let sac = env.register_stellar_asset_contract_v2(admin.clone());
        sac.address()
    }

    fn mint_to(env: &Env, token: &Address, to: &Address, amount: i128) {
        let sac = StellarAssetClient::new(env, token);
        sac.mint(to, &amount);
    }

    fn setup(env: &Env, members_count: u32) -> (Address, Address, ArisanConfig) {
        let admin = Address::generate(env);
        let vault = Address::generate(env);
        let token_addr = deploy_token(env, &admin);

        let config = ArisanConfig {
            name: String::from_str(env, "Test Arisan"),
            contribution_amount: 100_0000000,
            collateral_ratio_bps: 12500,
            token: token_addr,
            max_members: members_count,
            round_duration: 30 * DAY,
            slash_grace_period: 20 * DAY,
            min_reputation: 0,
            admin_fee_bps: 50,
            early_points: 3,
            mid_points: 1,
            late_penalty: -2,
        };
        (admin, vault, config)
    }

    #[test]
    fn test_collateral_formula() {
        let env = Env::default();
        let (_, _, config) = setup(&env, 5);
        let coll = required_collateral(&config);
        assert_eq!(coll, 500_0000000);
    }

    #[test]
    fn test_init_join_exit() {
        let env = Env::default();
        let (admin, vault, config) = setup(&env, 3);

        let contract_id = env.register(ArisanContract, ());
        let client = ArisanContractClient::new(&env, &contract_id);

        env.mock_all_auths();
        client.init(&admin, &vault, &config);

        let m1 = Address::generate(&env);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m1, 500_0000000);
        client.join(&m1);

        let pool = client.get_state();
        assert_eq!(pool.member_count, 1);

        env.mock_all_auths();
        client.exit(&m1);
        let pool2 = client.get_state();
        assert_eq!(pool2.member_count, 0);
        assert!(!pool2.is_full);
    }

    #[test]
    fn test_full_lifecycle() {
        let env = Env::default();
        let (admin, vault, config) = setup(&env, 3);

        let contract_id = env.register(ArisanContract, ());
        let client = ArisanContractClient::new(&env, &contract_id);
        env.mock_all_auths();
        client.init(&admin, &vault, &config);

        let m1 = Address::generate(&env);
        let m2 = Address::generate(&env);
        let m3 = Address::generate(&env);

        env.mock_all_auths();
        mint_to(&env, &config.token, &m1, 500_0000000);
        client.join(&m1);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m2, 500_0000000);
        client.join(&m2);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m3, 500_0000000);
        client.join(&m3);

        let pool = client.get_state();
        assert!(pool.is_full);
        assert_eq!(pool.collateral_balance, required_collateral(&config) * 3);
        assert_eq!(pool.member_count, 3);

        env.mock_all_auths();
        client.start_pool();

        env.mock_all_auths();
        mint_to(&env, &config.token, &m1, 200_0000000);
        client.contribute(&m1);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m2, 200_0000000);
        client.contribute(&m2);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m3, 200_0000000);
        client.contribute(&m3);

        let pool2 = client.get_state();
        assert_eq!(pool2.pool_funds_balance, 300_0000000);

        env.mock_all_auths();
        let winner = client.select_winner();
        assert_ne!(winner, Address::generate(&env));

        let pool3 = client.get_state();
        assert_eq!(pool3.current_round, 2);
        assert_eq!(pool3.pool_funds_balance, 0);
    }

    #[test]
    fn test_tickets_with_streak() {
        let info = MemberInfo {
            address: Address::generate(&Env::default()),
            collateral_amount: 0, total_contributed: 0, missed_payments: 0,
            has_won: false, is_active: true, joined_at: 0, last_deposit_round: 0,
            deposited_this_round: false,
            early_payments: 5, mid_payments: 0, late_payments: 0,
            total_points: 0, current_streak: 6,
            yield_earned: 0, gacha_claimed: false,
            winner_payout_claimed: false,
        };
        let tickets = compute_tickets(&info);
        // 5 early * 3 = 15 base, streak 6 => x1.5 => 22.5 -> 22, +1 base = 23
        assert!(tickets > 15, "streak should boost tickets");
    }

    #[test]
    fn test_slash() {
        let env = Env::default();
        let (admin, vault, config) = setup(&env, 3);

        let contract_id = env.register(ArisanContract, ());
        let client = ArisanContractClient::new(&env, &contract_id);
        env.mock_all_auths();
        client.init(&admin, &vault, &config);

        let m1 = Address::generate(&env);
        let m2 = Address::generate(&env);
        let m3 = Address::generate(&env);

        env.mock_all_auths();
        mint_to(&env, &config.token, &m1, 500_0000000);
        client.join(&m1);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m2, 500_0000000);
        client.join(&m2);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m3, 500_0000000);
        client.join(&m3);
        env.mock_all_auths();
        client.start_pool();

        env.mock_all_auths();
        mint_to(&env, &config.token, &m1, 200_0000000);
        client.contribute(&m1);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m2, 200_0000000);
        client.contribute(&m2);

        env.ledger().set_timestamp(env.ledger().timestamp() + 21 * DAY);

        let slashed = client.slash_collateral(&m3);
        assert_eq!(slashed, 100_0000000);

        let info = client.get_member_info(&m3).unwrap();
        assert_eq!(info.missed_payments, 1);
        assert!(info.total_points < 10);
    }
}
