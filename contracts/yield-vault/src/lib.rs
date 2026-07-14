#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec, token};

#[contracttype]
#[derive(Clone)]
pub enum VaultKey {
    Admin,
    Token,
    TotalVaulted,
    TotalDistributed,
    LastGachaTimestamp,
    GachaLocked,
    Arisan(u32),
    ArisanCount,
    Participant(u32),
}

#[contracttype]
#[derive(Clone)]
pub struct GachaWinner {
    pub address: Address,
    pub tier: u32,
    pub tickets: u32,
    pub prize: i128,
}

const SECONDS_PER_DAY: u64 = 86400;
const GACHA_GAP: u64 = SECONDS_PER_DAY * 350;  // min ~350 days between gachas
const GACHA_SALT: u64 = 0x41525433314C;

fn derive_seed(env: &Env, salt: u64) -> u64 {
    let ledger = env.ledger();
    (ledger.sequence() as u64).wrapping_mul(ledger.timestamp()).wrapping_add(salt)
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
    let roll = unbiased_mod(seed, total as u64);
    let mut cumulative: u32 = 0;
    for (i, w) in weights.iter().enumerate() {
        cumulative = cumulative.saturating_add(w);
        if roll < cumulative as u64 { return i as u32; }
    }
    (weights.len().saturating_sub(1)) as u32
}

fn check_annual_date(env: &Env) {
    let ts = env.ledger().timestamp();
    // Approximate: June = month 6, day 30 = ~181 days into a non-leap year
    // For MVP: allow gacha from June 1 to July 31 (30 day window)
    let year_seconds = SECONDS_PER_DAY * 365;
    let base = ts / year_seconds * year_seconds;
    let year_day = (ts - base) / SECONDS_PER_DAY;
    assert!(year_day >= 150 && year_day <= 210, "gacha only allowed June-July");
}

#[contract]
pub struct YieldVault;

#[contractimpl]
impl YieldVault {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&VaultKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&VaultKey::Admin, &admin);
        env.storage().instance().set(&VaultKey::TotalVaulted, &0i128);
        env.storage().instance().set(&VaultKey::TotalDistributed, &0i128);
        env.storage().instance().set(&VaultKey::LastGachaTimestamp, &0u64);
        env.storage().instance().set(&VaultKey::ArisanCount, &0u32);
        env.storage().instance().set(&VaultKey::GachaLocked, &false);
    }

    pub fn receive_yield(env: Env, from_arisan: Address, amount: i128) {
        from_arisan.require_auth();
        assert!(amount > 0, "amount must be positive");

        let token_addr = env.storage().instance().get(&VaultKey::Token).unwrap_or_else(|| {
            panic!("token not configured; call set_token first")
        });
        let token_client = token::Client::new(&env, &token_addr);
        let balance_before = token_client.balance(&env.current_contract_address());
        token_client.transfer(&from_arisan, &env.current_contract_address(), &amount);
        let balance_after = token_client.balance(&env.current_contract_address());
        let received = balance_after - balance_before;
        assert!(received >= amount, "token transfer failed");

        let mut total = env.storage().instance().get(&VaultKey::TotalVaulted).unwrap_or(0);
        total += received;
        env.storage().instance().set(&VaultKey::TotalVaulted, &total);
    }

    pub fn set_token(env: Env, token_addr: Address) {
        let admin: Address = env.storage().instance().get(&VaultKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&VaultKey::Token, &token_addr);
    }

    pub fn register_participant(env: Env, arisan: Address, participant: Address, tickets: u32) {
        arisan.require_auth();
        let mut count: u32 = env.storage().instance().get(&VaultKey::ArisanCount).unwrap_or(0);
        let key = VaultKey::Participant(count);
        env.storage().instance().set(&key, &(participant, tickets));
        count += 1;
        env.storage().instance().set(&VaultKey::ArisanCount, &count);
    }

    pub fn annual_gacha(env: Env) -> Vec<GachaWinner> {
        let admin: Address = env.storage().instance().get(&VaultKey::Admin).unwrap();
        admin.require_auth();

        check_annual_date(&env);

        let last_ts: u64 = env.storage().instance().get(&VaultKey::LastGachaTimestamp).unwrap_or(0);
        let now = env.ledger().timestamp();
        assert!(now - last_ts >= GACHA_GAP || last_ts == 0, "gacha already done this year");

        let locked: bool = env.storage().instance().get(&VaultKey::GachaLocked).unwrap_or(false);
        assert!(!locked, "gacha already executed — reset participants first");

        let total_dist: i128 = env.storage().instance().get(&VaultKey::TotalDistributed).unwrap_or(0);
        let token_addr: Address = env.storage().instance().get(&VaultKey::Token).unwrap();
        let available = token::Client::new(&env, &token_addr).balance(&env.current_contract_address());
        if available <= 0 { return Vec::new(&env); }

        let count: u32 = env.storage().instance().get(&VaultKey::ArisanCount).unwrap_or(0);
        let mut participants: Vec<(Address, u32)> = Vec::new(&env);
        let mut weights = Vec::new(&env);
        for i in 0..count {
            let (addr, tickets): (Address, u32) = env.storage().instance()
                .get(&VaultKey::Participant(i)).unwrap();
            participants.push_back((addr, tickets));
            weights.push_back(tickets);
        }

        let grand_prize = available * 50 / 100;
        let runner_prize = available * 15 / 100;
        let consolation_total = available * 20 / 100;

        let mut winners = Vec::new(&env);

        let gidx = weighted_random_index(&env, &weights, GACHA_SALT);
        let (grand_addr, grand_tickets) = participants.get(gidx).unwrap();
        winners.push_back(GachaWinner { address: grand_addr.clone(), tier: 0, tickets: grand_tickets, prize: grand_prize });

        let seed2 = GACHA_SALT.wrapping_mul(7919);
        let seed3 = GACHA_SALT.wrapping_mul(6271);
        let mut runner_winners: Vec<Address> = Vec::new(&env);
        for &s in [seed2, seed3].iter() {
            let idx = weighted_random_index(&env, &weights, s);
            let (addr, tickets) = participants.get(idx).unwrap();
            if !runner_winners.contains(&addr) {
                runner_winners.push_back(addr.clone());
                winners.push_back(GachaWinner { address: addr.clone(), tier: 1, tickets, prize: runner_prize });
            } else if participants.len() > runner_winners.len() {
                // Try alternate index if duplicate
                let alt_salt = s.wrapping_add(1);
                let alt_idx = weighted_random_index(&env, &weights, alt_salt);
                let (alt_addr, alt_tickets) = participants.get(alt_idx).unwrap();
                if !runner_winners.contains(&alt_addr) && alt_addr.clone() != grand_addr.clone() {
                    runner_winners.push_back(alt_addr.clone());
                    winners.push_back(GachaWinner { address: alt_addr.clone(), tier: 1, tickets: alt_tickets, prize: runner_prize });
                }
            }
        }

        let num_consolation = participants.len().saturating_sub(1 + runner_winners.len());
        if num_consolation > 0 {
            let each = consolation_total / (num_consolation as i128);
            for (addr, tickets) in participants.iter() {
                let already = winners.iter().any(|w: GachaWinner| w.address == addr.clone());
                if !already {
                    winners.push_back(GachaWinner { address: addr.clone(), tier: 2, tickets, prize: each });
                }
            }
        }

        let token_addr: Address = env.storage().instance().get(&VaultKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_addr);
        let vault_addr = env.current_contract_address();
        for w in winners.iter() {
            if w.prize > 0 {
                token_client.transfer(&vault_addr, &w.address, &w.prize);
            }
        }

        let new_dist = total_dist + available;
        env.storage().instance().set(&VaultKey::TotalDistributed, &new_dist);
        env.storage().instance().set(&VaultKey::LastGachaTimestamp, &now);
        env.storage().instance().set(&VaultKey::GachaLocked, &true);
        env.storage().instance().set(&VaultKey::ArisanCount, &0u32);

        winners
    }

    pub fn reset_for_new_year(env: Env) {
        let admin: Address = env.storage().instance().get(&VaultKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&VaultKey::GachaLocked, &false);
    }

    pub fn get_participant_count(env: Env) -> u32 {
        env.storage().instance().get(&VaultKey::ArisanCount).unwrap_or(0)
    }

    pub fn get_state(env: Env) -> (i128, i128, u64, bool) {
        let total: i128 = env.storage().instance().get(&VaultKey::TotalVaulted).unwrap_or(0);
        let dist: i128 = env.storage().instance().get(&VaultKey::TotalDistributed).unwrap_or(0);
        let last: u64 = env.storage().instance().get(&VaultKey::LastGachaTimestamp).unwrap_or(0);
        let locked: bool = env.storage().instance().get(&VaultKey::GachaLocked).unwrap_or(false);
        (total, dist, last, locked)
    }
}

#[cfg(test)]
mod test {
    use soroban_sdk::{Env, Address};
    use soroban_sdk::testutils::Address as _;
    use crate::{YieldVault, YieldVaultClient};

    #[test]
    fn test_init_and_state() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let contract_id = env.register(YieldVault, ());
        let client = YieldVaultClient::new(&env, &contract_id);
        client.init(&admin);
        let (total, dist, _, locked) = client.get_state();
        assert_eq!(total, 0);
        assert_eq!(dist, 0);
        assert!(!locked);
    }
}
