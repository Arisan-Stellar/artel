#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, token};

const COOLDOWN_SECS: u64 = 3600;
const CLAIM_AMOUNT: i128 = 1000_0000000;

#[contracttype]
#[derive(Clone)]
pub enum FaucetKey { Admin, Token }

#[contract]
pub struct ArtelFaucet;

#[contractimpl]
impl ArtelFaucet {
    pub fn init(env: Env, admin: Address, token_addr: Address) {
        admin.require_auth();
        env.storage().instance().set(&FaucetKey::Admin, &admin);
        env.storage().instance().set(&FaucetKey::Token, &token_addr);
    }

    pub fn claim(env: Env, to: Address) -> i128 {
        to.require_auth();

        let now = env.ledger().timestamp();
        if let Some(last) = env.storage().temporary().get::<Address, u64>(&to) {
            assert!(now - last >= COOLDOWN_SECS, "wait before claiming again");
        }
        env.storage().temporary().set(&to, &now);

        let token_addr: Address = env.storage().instance().get(&FaucetKey::Token).unwrap();
        let sac = token::StellarAssetClient::new(&env, &token_addr);
        sac.mint(&to, &CLAIM_AMOUNT);

        env.events().publish((symbol_short!("claimed"), CLAIM_AMOUNT), to.clone());
        CLAIM_AMOUNT
    }

    pub fn get_token(env: Env) -> Address {
        env.storage().instance().get(&FaucetKey::Token).unwrap()
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_init() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let token = env.register_stellar_asset_contract_v2(admin.clone()).address();

        let contract_id = env.register(ArtelFaucet, ());
        let client = ArtelFaucetClient::new(&env, &contract_id);

        env.mock_all_auths();
        client.init(&admin, &token);

        let got = client.get_token();
        assert_eq!(got, token);
    }
}
