#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Map, String, Vec};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct PoolEntry {
    pub contract_id: Address,
    pub admin: Address,
    pub name: String,
    pub contribution_amount: i128,
    pub max_members: u32,
    pub current_members: u32,
    pub state: u32,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct FactoryAdmin {
    pub address: Address,
}

#[contract]
pub struct ArisanFactory;

fn get_admin(env: &Env) -> Address {
    env.storage().instance()
        .get(&symbol_short!("admin"))
        .unwrap()
}

#[contractimpl]
impl ArisanFactory {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("already initialized");
        }
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage().instance().set(&symbol_short!("count"), &0u32);
        env.storage().instance().set(&symbol_short!("pools"), &Map::<u32, Address>::new(&env));
    }

    pub fn register_pool(env: Env, pool_address: Address, deployer: Address, name: String, contribution: i128, max_members: u32) -> u32 {
        deployer.require_auth();
        let mut count: u32 = env.storage().instance().get(&symbol_short!("count")).unwrap_or(0);
        let mut pools: Map<u32, Address> = env.storage().instance().get(&symbol_short!("pools")).unwrap();
        pools.set(count, pool_address.clone());
        env.storage().instance().set(&symbol_short!("pools"), &pools);
        count += 1;
        env.storage().instance().set(&symbol_short!("count"), &count);
        env.storage().instance().set(&pool_address, &PoolEntry {
            contract_id: pool_address.clone(),
            admin: deployer,
            name,
            contribution_amount: contribution,
            max_members,
            current_members: 0,
            state: 0,
        });
        env.events().publish((symbol_short!("pool_reg"), count), pool_address);
        count
    }

    pub fn get_pools(env: Env) -> Vec<Address> {
        let count: u32 = env.storage().instance().get(&symbol_short!("count")).unwrap_or(0);
        let pools: Map<u32, Address> = env.storage().instance().get(&symbol_short!("pools")).unwrap();
        let mut result = Vec::new(&env);
        for i in 0..count {
            if let Some(addr) = pools.get(i) {
                result.push_back(addr);
            }
        }
        result
    }

    pub fn get_pool_count(env: Env) -> u32 {
        env.storage().instance().get(&symbol_short!("count")).unwrap_or(0)
    }

    pub fn get_pool_by_index(env: Env, index: u32) -> Option<Address> {
        let pools: Map<u32, Address> = env.storage().instance().get(&symbol_short!("pools")).unwrap();
        pools.get(index)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_factory_flow() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let contract_id = env.register(ArisanFactory, ());
        let client = ArisanFactoryClient::new(&env, &contract_id);

        env.mock_all_auths();
        client.init(&admin);

        let pool_addr = Address::generate(&env);
        let pool_deployer = Address::generate(&env);

        env.mock_all_auths();
        client.register_pool(&pool_addr, &pool_deployer, &String::from_str(&env, "Test Pool"), &100_0000000, &10);

        let pools = client.get_pools();
        assert_eq!(pools.len(), 1);
        assert_eq!(client.get_pool_count(), 1);

        let found = client.get_pool_by_index(&0).unwrap();
        assert_eq!(found, pool_addr);
    }
}
