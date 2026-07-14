#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Map, String, Vec, token};

const DAY: u64 = 86400;
const EARLY_WINDOW: u64 = DAY * 10;
const MID_WINDOW: u64 = DAY * 20;

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
    pub pending_winner_payout: i128,
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
    pub winner_payout_balance: i128,
    pub yield_balance: i128,
    pub collateral_yield_balance: i128,
    pub col_yield_dist: i128,
    pub paused: bool,
    pub blend_btoken_balance: i128,
    pub end_period_gacha_balance: i128,
    pub last_harvest_time: u64,
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

// SECURITY (pseudo-random, NOT manipulation-proof): the seed is derived from public
// ledger data (sequence * timestamp) plus an instance counter, and the admin controls
// select_winner timing, so winner selection is biasable. A VRF or commit-reveal scheme
// is required for mainnet-grade fairness.
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

fn unbiased_mod(seed: u64, modulus: u64) -> u64 {
    if modulus <= 1 { return 0; }
    let mask = (1u64 << (64 - modulus.leading_zeros())) - 1;
    let mut state = seed;
    loop {
        let masked = state & mask;
        if masked < modulus { return masked; }
        state = state.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
    }
}

fn weighted_random_index(env: &Env, weights: &Vec<u32>, salt: u64) -> u32 {
    let total: u32 = weights.iter().sum();
    if total == 0 { return 0; }
    let seed = derive_seed(env, salt);
    bump_entropy_counter(env);
    let roll = unbiased_mod(seed, total as u64);
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

#[allow(unused_variables)]
fn blend_supply(env: &Env, blend_addr: &Address, _token_addr: &Address, _from: &Address, _amount: i128) {
// Blend Protocol not yet deployed — no-op
    let _ = (env, blend_addr, _token_addr, _from, _amount);
}

#[allow(unused_variables)]
fn blend_withdraw(env: &Env, blend_addr: &Address, _token_addr: &Address, _to: &Address, _amount: i128) {
// Blend Protocol not yet deployed — no-op
    let _ = (env, blend_addr, _token_addr, _to, _amount);
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

fn load_pool(env: &Env, pool_id: u32) -> Pool {
    env.storage().persistent().get(&(symbol_short!("pool"), pool_id)).unwrap()
}

fn save_pool(env: &Env, pool_id: u32, pool: &Pool) {
    env.storage().persistent().set(&(symbol_short!("pool"), pool_id), pool);
}

#[contract]
pub struct ArisanContract;

#[contractimpl]
impl ArisanContract {
    pub fn create_pool(env: Env, admin: Address, yield_vault: Address, config: ArisanConfig) -> u32 {
        admin.require_auth();
        validate_config(&config);

        let pool_id: u32 = env.storage().instance().get(&symbol_short!("count")).unwrap_or(0);

        let mut pool = Pool {
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
            winner_payout_balance: 0,
            yield_balance: 0,
            collateral_yield_balance: 0,
            col_yield_dist: 0,
            paused: false,
            blend_btoken_balance: 0,
            end_period_gacha_balance: 0,
            last_harvest_time: env.ledger().timestamp(),
        };

        let collateral = required_collateral(&pool.config);
        let contribution = pool.config.contribution_amount;
        let ct = contract_id(&env);
        transfer_from(&env, &pool.config.token, &admin, &ct, collateral.saturating_add(contribution));

        pool.collateral_balance = collateral;
        pool.collateral_yield_balance = collateral;
        pool.pool_funds_balance = contribution;
        let info = MemberInfo {
            address: admin.clone(),
            collateral_amount: collateral,
            total_contributed: contribution,
            missed_payments: 0,
            has_won: false,
            is_active: true,
            joined_at: get_now(&env),
            last_deposit_round: 1,
            deposited_this_round: true,
            early_payments: 1,
            mid_payments: 0,
            late_payments: 0,
            total_points: 10 + pool.config.early_points as i32,
            current_streak: 1,
            yield_earned: 0,
            gacha_claimed: false,
            pending_winner_payout: 0,
            winner_payout_claimed: false,
        };
        pool.members.set(admin.clone(), info);
        pool.member_list.push_back(admin.clone());
        pool.active_depositors_count = 1;
        if pool.member_list.len() == pool.config.max_members {
            pool.is_full = true;
        }

        save_pool(&env, pool_id, &pool);
        env.storage().instance().set(&symbol_short!("count"), &(pool_id + 1));
        env.storage().instance().set(&symbol_short!("n"), &0u64);
        env.events().publish((symbol_short!("poolnew"), pool_id), admin);
        pool_id
    }

    pub fn get_pool_count(env: Env) -> u32 {
        env.storage().instance().get(&symbol_short!("count")).unwrap_or(0)
    }

    // -----------------------------------------------------------------------
    // JOIN — member deposits collateral + transfers tokens to contract
    // -----------------------------------------------------------------------
    pub fn join(env: Env, pool_id: u32, member: Address) -> Result<MemberInfo, soroban_sdk::Error> {
        member.require_auth();
        let mut pool: Pool = load_pool(&env, pool_id);
        assert!(!pool.paused, "pool is paused");
        assert_eq!(pool.state, ArisanState::Pending, "pool not accepting members");
        assert!(!pool.members.contains_key(member.clone()), "already a member");
        assert!((pool.member_list.len() as u32) < pool.config.max_members, "pool is full");

        let collateral = required_collateral(&pool.config);
        let contribution = pool.config.contribution_amount;
        let ct = contract_id(&env);

        transfer_from(&env, &pool.config.token, &member, &ct, collateral.saturating_add(contribution));
        blend_supply(&env, &pool.config.blend_address, &pool.config.token, &ct, collateral);
        pool.blend_btoken_balance = pool.blend_btoken_balance.saturating_add(collateral);

        pool.collateral_balance = pool.collateral_balance.saturating_add(collateral);
        pool.collateral_yield_balance = pool.collateral_yield_balance.saturating_add(collateral);
        pool.pool_funds_balance = pool.pool_funds_balance.saturating_add(contribution);

        let info = MemberInfo {
            address: member.clone(),
            collateral_amount: collateral,
            total_contributed: contribution,
            missed_payments: 0,
            has_won: false,
            is_active: true,
            joined_at: get_now(&env),
            last_deposit_round: 1,
            deposited_this_round: true,
            early_payments: 1,
            mid_payments: 0,
            late_payments: 0,
            total_points: 10 + pool.config.early_points as i32,
            current_streak: 1,
            yield_earned: 0,
            gacha_claimed: false,
            pending_winner_payout: 0,
            winner_payout_claimed: false,
        };

        pool.members.set(member.clone(), info.clone());
        pool.member_list.push_back(member.clone());
        pool.active_depositors_count = pool.member_list.len();

        if pool.member_list.len() == pool.config.max_members as u32 {
            pool.is_full = true;
        }

        save_pool(&env, pool_id, &pool);
        env.events().publish((symbol_short!("memjoin"), collateral), member);
        Ok(info)
    }

    // -----------------------------------------------------------------------
    // EXIT — leave pool before it starts (returns collateral)
    // -----------------------------------------------------------------------
    pub fn exit(env: Env, pool_id: u32, member: Address) -> Result<i128, soroban_sdk::Error> {
        member.require_auth();
        let mut pool: Pool = load_pool(&env, pool_id);
        assert_eq!(pool.state, ArisanState::Pending, "can only exit before pool starts");

        assert!(pool.members.contains_key(member.clone()), "not a member");
        let info = pool.members.get(member.clone()).unwrap();
        let collateral_refund = info.collateral_amount;
        let deposit_refund = info.total_contributed;
        let refund = collateral_refund.saturating_add(deposit_refund);

        let ct = contract_id(&env);
        transfer_from(&env, &pool.config.token, &ct, &member, refund);

        pool.members.remove(member.clone());
        pool.collateral_balance = pool.collateral_balance.saturating_sub(collateral_refund);
        pool.pool_funds_balance = pool.pool_funds_balance.saturating_sub(deposit_refund);

        let mut new_list = Vec::new(&env);
        for m in pool.member_list.iter() {
            if m != member { new_list.push_back(m); }
        }
        pool.member_list = new_list;
        pool.active_depositors_count = pool.member_list.len();
        pool.is_full = pool.member_list.len() == pool.config.max_members as u32;

        save_pool(&env, pool_id, &pool);
        env.events().publish((symbol_short!("memexit"), refund), member);
        Ok(refund)
    }

    // -----------------------------------------------------------------------
    // START — admin starts the pool
    // -----------------------------------------------------------------------
    pub fn start_pool(env: Env, pool_id: u32) {
        let mut pool: Pool = load_pool(&env, pool_id);
        pool.admin.require_auth();
        assert!(pool.is_full, "pool not full");
        assert_eq!(pool.state, ArisanState::Pending, "already started");

        pool.state = ArisanState::Active;
        pool.current_round = 1;
        pool.round_start_time = get_now(&env);
        pool.pool_start_time = get_now(&env);
        pool.active_depositors_count = pool.member_list.len();

        save_pool(&env, pool_id, &pool);
        env.events().publish((symbol_short!("poolstart"), pool.current_round), pool.admin);
    }

    // -----------------------------------------------------------------------
    // CONTRIBUTE — pay monthly dues + earn points based on timing
    // -----------------------------------------------------------------------
    pub fn contribute(env: Env, pool_id: u32, member: Address) -> Result<MemberInfo, soroban_sdk::Error> {
        member.require_auth();
        let mut pool: Pool = load_pool(&env, pool_id);
        assert!(!pool.paused, "pool is paused");
        assert_eq!(pool.state, ArisanState::Active, "pool not active");

        assert!(pool.members.contains_key(member.clone()), "not a member");
        let mut info = pool.members.get(member.clone()).unwrap();
        assert!(info.is_active, "member is not active");
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

        pool.members.set(member.clone(), info.clone());
        pool.active_depositors_count = pool.active_depositors_count.saturating_add(1);

        save_pool(&env, pool_id, &pool);
        env.events().publish((symbol_short!("contrib"), contribution), member.clone());
        Ok(info)
    }

    // -----------------------------------------------------------------------
    // SLASH — admin-only: slash defaulter's collateral after grace period
    // -----------------------------------------------------------------------
    pub fn slash_collateral(env: Env, pool_id: u32, defaulter: Address) -> Result<i128, soroban_sdk::Error> {
        let mut pool: Pool = load_pool(&env, pool_id);
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
        }

        pool.collateral_balance = pool.collateral_balance.saturating_sub(slash_amount);
        pool.members.set(defaulter.clone(), info);

        save_pool(&env, pool_id, &pool);
        if slash_amount > 0 {
            env.events().publish((symbol_short!("slashed"), slash_amount), defaulter);
        }
        Ok(slash_amount)
    }

    // -----------------------------------------------------------------------
    // SELECT WINNER — all deposited? pick random winner + transfer pool
    // -----------------------------------------------------------------------
    pub fn select_winner(env: Env, pool_id: u32) -> Result<Address, soroban_sdk::Error> {
        let mut pool: Pool = load_pool(&env, pool_id);
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

        let weight_sum: u32 = weights.iter().sum();
        assert!(weight_sum > 0, "no eligible winner this round");

        let idx = weighted_random_index(&env, &weights, 0x4359434C4531) as u32;
        let winner = members.get(idx).unwrap();

        let payout = pool.pool_funds_balance;
        pool.pool_funds_balance = 0;

        let ct = contract_id(&env);
        blend_withdraw(&env, &pool.config.blend_address, &pool.config.token, &ct, payout);
        pool.blend_btoken_balance = pool.blend_btoken_balance.saturating_sub(payout);
        pool.winner_payout_balance = pool.winner_payout_balance.saturating_add(payout);

        let mut winfo = pool.members.get(winner.clone()).unwrap();
        winfo.has_won = true;
        winfo.pending_winner_payout = winfo.pending_winner_payout.saturating_add(payout);
        pool.members.set(winner.clone(), winfo);

        pool.round_winners.set(pool.current_round, winner.clone());
        pool.current_round = pool.current_round.saturating_add(1);
        pool.round_start_time = get_now(&env);

        for maddr in members.iter() {
            if pool.members.contains_key(maddr.clone()) {
                let mut mi = pool.members.get(maddr.clone()).unwrap();
                mi.deposited_this_round = false;
                pool.members.set(maddr, mi);
            }
        }
        pool.active_depositors_count = 0;

        if pool.current_round > pool.total_rounds {
            pool.state = ArisanState::Completed;
        }

        save_pool(&env, pool_id, &pool);
        env.events().publish((symbol_short!("winsel"), payout), winner.clone());
        Ok(winner)
    }

    // -----------------------------------------------------------------------
    // CLAIM WINNER PAYOUT — pull-based: only winner can withdraw their escrowed payout
    // -----------------------------------------------------------------------
    pub fn claim_winner_payout(env: Env, pool_id: u32, member: Address) -> Result<i128, soroban_sdk::Error> {
        member.require_auth();
        let mut pool: Pool = load_pool(&env, pool_id);

        let mut info = pool.members.get(member.clone()).unwrap();
        assert!(info.pending_winner_payout > 0, "no pending payout");
        assert!(!info.winner_payout_claimed, "payout already claimed");

        let amount = info.pending_winner_payout;
        assert!(pool.winner_payout_balance >= amount, "insufficient escrow balance");

        pool.winner_payout_balance = pool.winner_payout_balance.saturating_sub(amount);
        info.pending_winner_payout = 0;
        info.winner_payout_claimed = true;
        pool.members.set(member.clone(), info);

        let ct = contract_id(&env);
        transfer_from(&env, &pool.config.token, &ct, &member, amount);

        save_pool(&env, pool_id, &pool);
        env.events().publish((symbol_short!("winclaim"), amount), member.clone());
        Ok(amount)
    }

    // -----------------------------------------------------------------------
    // HARVEST YIELD — Admin deposits real yield from Blend into the pool
    // -----------------------------------------------------------------------
    pub fn harvest_yield(env: Env, pool_id: u32, amount: i128) -> Result<YieldDistribution, soroban_sdk::Error> {
        let mut pool: Pool = load_pool(&env, pool_id);
        pool.admin.require_auth();

        assert!(amount > 0, "must harvest positive amount");

        let ct = contract_id(&env);
        transfer_from(&env, &pool.config.token, &pool.admin, &ct, amount);

        let member_share = amount.saturating_mul(75) / 100;
        let end_period_gacha = amount - member_share;
        
        // 25% goes to Gacha
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

        pool.col_yield_dist = pool.col_yield_dist.saturating_add(amount);
        pool.last_harvest_time = env.ledger().timestamp();

        let dist = YieldDistribution {
            ops_share: 0,
            member_share,
            vault_share: 0,
            per_member_share: per_member_final,
        };

        save_pool(&env, pool_id, &pool);
        env.events().publish((symbol_short!("harvest"), amount), dist.clone());
        Ok(dist)
    }

    // -----------------------------------------------------------------------
    // GACHA POOL YIELD — weighted lottery at pool end, fixed runner-up dedup
    // -----------------------------------------------------------------------
    pub fn disburse_pool_yield_gacha(env: Env, pool_id: u32) -> Result<Vec<GachaWinner>, soroban_sdk::Error> {
        let mut pool: Pool = load_pool(&env, pool_id);
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
            save_pool(&env, pool_id, &pool);
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
        let mut distributed: i128 = 0;
        for w in winners.iter() {
            blend_withdraw(&env, &pool.config.blend_address, &pool.config.token, &ct, w.prize_amount);
            pool.blend_btoken_balance = pool.blend_btoken_balance.saturating_sub(w.prize_amount);
            transfer_from(&env, &pool.config.token, &ct, &w.address, w.prize_amount);
            distributed = distributed.saturating_add(w.prize_amount);
        }

        pool.yield_balance = pool.yield_balance.saturating_sub(distributed);
        save_pool(&env, pool_id, &pool);
        env.events().publish((symbol_short!("gachadone"), total_yield), ());
        Ok(winners)
    }

    // -----------------------------------------------------------------------
    // CLAIM FINAL — return collateral + proportional yield after pool ends
    // -----------------------------------------------------------------------
    pub fn claim_final(env: Env, pool_id: u32, member: Address) -> Result<(i128, i128), soroban_sdk::Error> {
        member.require_auth();
        let mut pool: Pool = load_pool(&env, pool_id);
        assert_eq!(pool.state, ArisanState::Completed, "pool not completed");

        assert!(pool.members.contains_key(member.clone()), "not a member");
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
        save_pool(&env, pool_id, &pool);
        env.events().publish((symbol_short!("finclaim"), total), member);
        Ok((collateral_return, yield_return))
    }

    // ---- ADMIN CONTROLS ----


    pub fn pause(env: Env, pool_id: u32) {
        let mut pool: Pool = load_pool(&env, pool_id);
        pool.admin.require_auth();
        pool.paused = true;
        save_pool(&env, pool_id, &pool);
        env.events().publish((symbol_short!("paused"),), pool.admin);
    }

    pub fn unpause(env: Env, pool_id: u32) {
        let mut pool: Pool = load_pool(&env, pool_id);
        pool.admin.require_auth();
        pool.paused = false;
        save_pool(&env, pool_id, &pool);
        env.events().publish((symbol_short!("unpaused"),), pool.admin);
    }

    // ---- VIEWS ----

    pub fn get_state(env: Env, pool_id: u32) -> PoolSummary {
        let pool: Pool = load_pool(&env, pool_id);
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
            last_harvest_time: pool.last_harvest_time,
        }
    }

    pub fn get_config(env: Env, pool_id: u32) -> ArisanConfig {
        let pool: Pool = load_pool(&env, pool_id);
        pool.config
    }

    pub fn get_member_info(env: Env, pool_id: u32, member: Address) -> Option<MemberInfo> {
        let pool: Pool = load_pool(&env, pool_id);
        pool.members.get(member)
    }

    pub fn get_tickets(env: Env, pool_id: u32, member: Address) -> u32 {
        let pool: Pool = load_pool(&env, pool_id);
        if let Some(info) = pool.members.get(member) {
            if info.is_active { return compute_tickets(&info); }
        }
        0
    }

    pub fn get_leaderboard(env: Env, pool_id: u32) -> Vec<(Address, u32)> {
        let pool: Pool = load_pool(&env, pool_id);
        let mut result = Vec::new(&env);
        for maddr in pool.member_list.iter() {
            if let Some(info) = pool.members.get(maddr.clone()) {
                result.push_back((maddr, compute_tickets(&info)));
            }
        }
        result
    }

    pub fn get_admin(env: Env, pool_id: u32) -> Address {
        let pool: Pool = load_pool(&env, pool_id);
        pool.admin
    }

    pub fn get_round_winner(env: Env, pool_id: u32, round: u32) -> Option<Address> {
        let pool: Pool = load_pool(&env, pool_id);
        pool.round_winners.get(round)
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
    pub last_harvest_time: u64,
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
            blend_address: Address::generate(env),
            max_members: members_count,
            round_duration: 30 * DAY,
            slash_grace_period: 20 * DAY,
            min_reputation: 0,
            admin_fee_bps: 0,
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
        mint_to(&env, &config.token, &admin, 500_0000000);
        let pool_id = client.create_pool(&admin, &vault, &config);

        let pool = client.get_state(&pool_id);
        assert_eq!(pool.member_count, 1);

        let m1 = Address::generate(&env);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m1, 500_0000000);
        client.join(&pool_id, &m1);

        let pool2 = client.get_state(&pool_id);
        assert_eq!(pool2.member_count, 2);
        assert_eq!(pool2.pool_funds_balance, config.contribution_amount * 2);

        env.mock_all_auths();
        client.exit(&pool_id, &m1);
        let pool3 = client.get_state(&pool_id);
        assert_eq!(pool3.member_count, 1);
        assert!(!pool3.is_full);
        assert_eq!(pool3.pool_funds_balance, config.contribution_amount, "exit must refund cycle-1 deposit");
    }

    #[test]
    fn test_full_lifecycle() {
        let env = Env::default();
        let (admin, vault, config) = setup(&env, 3);

        let contract_id = env.register(ArisanContract, ());
        let client = ArisanContractClient::new(&env, &contract_id);
        env.mock_all_auths();
        mint_to(&env, &config.token, &admin, 500_0000000);
        let pool_id = client.create_pool(&admin, &vault, &config);

        let m1 = Address::generate(&env);
        let m2 = Address::generate(&env);

        env.mock_all_auths();
        mint_to(&env, &config.token, &m1, 500_0000000);
        client.join(&pool_id, &m1);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m2, 500_0000000);
        client.join(&pool_id, &m2);

        let pool = client.get_state(&pool_id);
        assert!(pool.is_full);
        assert_eq!(pool.collateral_balance, required_collateral(&config) * 3);
        assert_eq!(pool.member_count, 3);
        assert_eq!(pool.pool_funds_balance, 300_0000000, "cycle-1 pot funded at join");

        env.mock_all_auths();
        client.start_pool(&pool_id);

        let pool2 = client.get_state(&pool_id);
        assert_eq!(pool2.pool_funds_balance, 300_0000000);

        env.mock_all_auths();
        let winner = client.select_winner(&pool_id);
        assert_ne!(winner, Address::generate(&env));

        let pool3 = client.get_state(&pool_id);
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
            pending_winner_payout: 0,
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
        mint_to(&env, &config.token, &admin, 500_0000000);
        let pool_id = client.create_pool(&admin, &vault, &config);

        let m1 = Address::generate(&env);
        let m2 = Address::generate(&env);

        env.mock_all_auths();
        mint_to(&env, &config.token, &m1, 500_0000000);
        client.join(&pool_id, &m1);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m2, 500_0000000);
        client.join(&pool_id, &m2);
        env.mock_all_auths();
        client.start_pool(&pool_id);

        env.mock_all_auths();
        let winner1 = client.select_winner(&pool_id);

        let mut payer: Option<Address> = None;
        let mut defaulter: Option<Address> = None;
        for m in [admin.clone(), m1.clone(), m2.clone()] {
            if m == winner1 { continue; }
            if payer.is_none() { payer = Some(m); } else { defaulter = Some(m); }
        }
        let payer = payer.unwrap();
        let defaulter = defaulter.unwrap();

        env.mock_all_auths();
        mint_to(&env, &config.token, &payer, 200_0000000);
        client.contribute(&pool_id, &payer);

        env.ledger().set_timestamp(env.ledger().timestamp() + 21 * DAY);

        env.mock_all_auths();
        let slashed = client.slash_collateral(&pool_id, &defaulter);
        assert_eq!(slashed, 100_0000000);

        let info = client.get_member_info(&pool_id, &defaulter).unwrap();
        assert_eq!(info.missed_payments, 1);
    }

    #[test]
    fn test_two_rounds_no_deadlock() {
        let env = Env::default();
        let (admin, vault, config) = setup(&env, 3);
        let contract_id = env.register(ArisanContract, ());
        let client = ArisanContractClient::new(&env, &contract_id);

        env.mock_all_auths();
        mint_to(&env, &config.token, &admin, 500_0000000);
        let pool_id = client.create_pool(&admin, &vault, &config);
        let m1 = Address::generate(&env);
        let m2 = Address::generate(&env);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m1, 500_0000000);
        client.join(&pool_id, &m1);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m2, 500_0000000);
        client.join(&pool_id, &m2);
        env.mock_all_auths();
        client.start_pool(&pool_id);

        env.mock_all_auths();
        let winner1 = client.select_winner(&pool_id);

        let state = client.get_state(&pool_id);
        assert_eq!(state.current_round, 2);
        assert_eq!(state.active_depositors_count, 0, "count must reset for the new round");

        for m in [&admin, &m1, &m2] {
            env.mock_all_auths();
            mint_to(&env, &config.token, m, 200_0000000);
            client.contribute(&pool_id, m);
        }
        env.mock_all_auths();
        let winner2 = client.select_winner(&pool_id);
        assert_ne!(winner2, winner1, "round 2 winner must differ from round 1 winner");
        assert_eq!(client.get_state(&pool_id).current_round, 3);
    }

    #[test]
    fn test_all_in_join() {
        let env = Env::default();
        let (admin, vault, config) = setup(&env, 3);
        let contract_id = env.register(ArisanContract, ());
        let client = ArisanContractClient::new(&env, &contract_id);

        env.mock_all_auths();
        mint_to(&env, &config.token, &admin, 500_0000000);
        let pool_id = client.create_pool(&admin, &vault, &config);

        let admin_info = client.get_member_info(&pool_id, &admin).unwrap();
        assert!(admin_info.deposited_this_round, "creator marked deposited for cycle 1");
        assert_eq!(admin_info.total_contributed, config.contribution_amount);
        assert_eq!(admin_info.early_payments, 1);

        let s = client.get_state(&pool_id);
        assert_eq!(s.pool_funds_balance, config.contribution_amount, "pot funded by creator cycle-1 deposit");
        assert_eq!(s.collateral_balance, required_collateral(&config));

        let m1 = Address::generate(&env);
        env.mock_all_auths();
        mint_to(&env, &config.token, &m1, 500_0000000);
        client.join(&pool_id, &m1);

        let s2 = client.get_state(&pool_id);
        assert_eq!(s2.pool_funds_balance, config.contribution_amount * 2, "each join adds a cycle-1 deposit");
        assert_eq!(s2.collateral_balance, required_collateral(&config) * 2);
        let m1_info = client.get_member_info(&pool_id, &m1).unwrap();
        assert!(m1_info.deposited_this_round);
        assert_eq!(m1_info.early_payments, 1);
    }

    #[test]
    fn test_fair_rosca_full() {
        let env = Env::default();
        let (admin, vault, config) = setup(&env, 3);
        let contract_id = env.register(ArisanContract, ());
        let client = ArisanContractClient::new(&env, &contract_id);

        let m1 = Address::generate(&env);
        let m2 = Address::generate(&env);
        let members = [admin.clone(), m1.clone(), m2.clone()];

        env.mock_all_auths();
        mint_to(&env, &config.token, &admin, 1000_0000000);
        let pool_id = client.create_pool(&admin, &vault, &config);
        for m in [&m1, &m2] {
            env.mock_all_auths();
            mint_to(&env, &config.token, m, 1000_0000000);
            client.join(&pool_id, m);
        }
        env.mock_all_auths();
        client.start_pool(&pool_id);

        let mut winners: Vec<Address> = Vec::new(&env);
        for round in 1..=3u32 {
            if round > 1 {
                for m in members.iter() {
                    env.mock_all_auths();
                    client.contribute(&pool_id, m);
                }
            }
            let st = client.get_state(&pool_id);
            assert_eq!(st.pool_funds_balance, config.contribution_amount * 3, "every round pot = 3 full contributions");
            env.mock_all_auths();
            winners.push_back(client.select_winner(&pool_id));
        }

        assert_eq!(client.get_state(&pool_id).state, ArisanState::Completed, "completes after N rounds for N members");
        assert!(winners.get(0) != winners.get(1) && winners.get(1) != winners.get(2) && winners.get(0) != winners.get(2), "each member wins exactly once");

        for m in members.iter() {
            let info = client.get_member_info(&pool_id, m).unwrap();
            assert!(info.has_won, "every member must have won a round");
            assert_eq!(info.total_contributed, config.contribution_amount * 3, "every member pays all 3 rounds");
            assert_eq!(info.pending_winner_payout, config.contribution_amount * 3, "every member wins one full pot");
        }
    }

    #[test]
    fn test_collateral_yield_no_phantom() {
        let env = Env::default();
        let (admin, vault, config) = setup(&env, 3);
        let contract_id = env.register(ArisanContract, ());
        let client = ArisanContractClient::new(&env, &contract_id);

        env.mock_all_auths();
        mint_to(&env, &config.token, &admin, 1000_0000000);
        let pool_id = client.create_pool(&admin, &vault, &config);

        env.mock_all_auths();
        client.harvest_yield(&pool_id, &1000_i128);
    }
}
