# 🏗️ ARTEL — Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 16)                         │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐   │
│  │  Pools   │ │ Simulator│ │Leaderboard│ │  Gacha / FAQ / ... │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬───────────┘   │
│       │            │            │                 │               │
│  ┌────┴────────────┴────────────┴─────────────────┴────────┐     │
│  │              Wallet Connector (4 wallet support)         │     │
│  │        Freighter · Albedo · xBull · Lobstr              │     │
│  └──────────────────────────┬──────────────────────────────┘     │
└─────────────────────────────┼────────────────────────────────────┘
                              │
┌─────────────────────────────┼────────────────────────────────────┐
│                    SOROBAN SMART CONTRACTS                        │
│                                                                   │
│  ┌──────────────────┐    ┌────────────────────────────┐          │
│  │  arisan-contract  │    │      yield-vault            │          │
│  │  Core ROSCA pool  │    │  25% gacha yield vault     │          │
│  │  17 functions     │    │  7 functions                │          │
│  │  ~1311 lines      │    │  ~242 lines                 │          │
│  └────────┬─────────┘    └─────────────┬──────────────┘          │
│           │                            │                          │
│  ┌────────┴────────────────────────────┴─────────────────────┐   │
│  │       artel-factory (pool registry) · artel-faucet        │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌───────────────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │  Stellar DEX       │  │  Blend   │  │  XLM Token (SAC)     │   │
│  │  (future)          │  │  Lending │  │  Native Asset        │   │
│  └───────────────────┘  └──────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Contract Model: 1 Contract → Many Pools

```
arisan-contract (1 instance)
│
├── pool_id: 0  →  "E2E Blend"        (Completed)
├── pool_id: 1  →  "Micro Arisan"     (Active)
├── pool_id: 2  →  "Premium Circle"   (Pending)
│
└── pool_id: N  →  (new pools)
```

`pool_id` = angka urut (`0, 1, 2...`), **bukan** contract address.
URL `/dapp/pools/1` = pool ke-2 di contract arisan yang sama.

## Blend Protocol Integration

### How it works

```
1. JOIN / CREATE POOL
   ├── User pays collateral + contribution to arisan contract
   └── arisan contract submits collateral to Blend Pool
       → env.invoke_contract(Blend, "submit", SupplyCollateral)
       → blend_btoken_balance increases

2. DURING POOL (yield accumulates)
   ├── Collateral sits in Blend, earning yield
   └── No action needed — yield accrues automatically

3. HARVEST YIELD (admin action)
   ├── withdraw ALL collateral from Blend
   ├── measure yield (balance check before/after)
   ├── re-supply principal to Blend
   └── distribute: 75% to members, 25% to gacha vault

4. CLAIM FINAL (end of pool)
   ├── withdraw collateral from Blend
   └── transfer to member
```

### Yield Distribution

```
Blend Yield
    │
    ├── 75% → member yield_earned (distributed equally)
    │
    └── 25% → yield_vault gacha balance (annual jackpot)
```

### Key Technical Details

| Detail | Value |
|--------|-------|
| **Blend API** | `submit(from, spender, to, requests)` |
| **SupplyCollateral** | `request_type: 2` |
| **WithdrawCollateral** | `request_type: 3` |
| **Blend Pool** | `CCEBVDYM...` (TestnetV2) |
| **Collateral only** to Blend | Contributions NOT supplied (only collateral) |
| **Yield tracking** | Balance diff via `invoke_contract::<i128>` |
| **Auth pattern** | `authorize_as_current_contract` |

### Fungsi yang terlibat

| Fungsi | Di kontrak | Aksi Blend |
|--------|-----------|------------|
| `create_pool()` | arisan | `blend_supply()` — admin collateral |
| `join()` | arisan | `blend_supply()` — member collateral |
| `exit()` | arisan | `blend_withdraw()` — refund collateral |
| `harvest_blend_yield()` | arisan | `blend_withdraw()` + `blend_supply()` |
| `claim_final()` | arisan | `blend_withdraw()` — return collateral |

## Vault Wire (Implemented 15 Juli)

### Flow

```
contribute() / create_pool() / join()
    │
    ├── 1. Transfer contribution (standard)
    │
    └── 2. Auto-register ke gacha vault
        ├── authorize_as_current_contract(vault.register_participant)
        ├── compute_tickets(&info) — based on payment timing
        └── invoke_contract(vault, "register_participant", args)
```

### Auth Pattern

```rust
// Di arisan contract (contribute())
env.authorize_as_current_contract(vec![
    InvokerContractAuthEntry::Contract(SubContractInvocation {
        context: ContractContext {
            contract: vault,
            fn_name: Symbol::new(&env, "register_participant"),
            args: vec![arisan.to_val(), member.to_val(), tickets.into_val(&env)],
        },
        sub_invocations: vec![],
    }),
]);

// Di vault contract
pub fn register_participant(env, arisan, participant, tickets) {
    arisan.require_auth();  // ← contract-level auth, not admin
    // ... store participant
}
```

## i18n Architecture

```
LocaleProvider (React Context)
    │
    ├── locale: "en" | "id"
    ├── dict: Dict (typed translations)
    ├── setLocale()
    └── toggle()
    
Setiap halaman dApp:
    const { dapp } = useDict();
    <h1>{dapp.pools.title}</h1>
```

## State Management

```
WalletContext (React Context)
    ├── address: string | null
    ├── walletType: WalletType
    ├── connect(type) → requests wallet access
    └── disconnect() → clears state
```
