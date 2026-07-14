# 🏗️ ARTEL — Architecture

## System Overview

```
┌──────────────────────────────────────────────────────┐
│                 BROWSER (User)                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Freighter │  │  Albedo  │  │  xBull / Lobstr   │  │
│  │ Extension │  │  (Web)   │  │  Extension/Mobile │  │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│       │              │                 │              │
│  ┌────┴──────────────┴─────────────────┴──────────┐  │
│  │          WalletContext (unified interface)       │  │
│  └──────────────────────┬──────────────────────────┘  │
│                         │                             │
│  ┌──────────────────────┴──────────────────────────┐  │
│  │    Next.js 16 Frontend (React 19 + TypeScript)   │  │
│  │    /app (landing page + dApp routes)             │  │
│  │    /api (proxy routes to Stellar RPC)            │  │
│  │    /components (reusable UI)                     │  │
│  │    /hooks (useFreighterTx, WalletContext)        │  │
│  │    /lib (artel-sdk, poolMath)                    │  │
│  └──────────────────────┬──────────────────────────┘  │
└─────────────────────────┼─────────────────────────────┘
                          │ HTTP / RPC
┌─────────────────────────┼─────────────────────────────┐
│              STELLAR TESTNET                           │
│                         │                              │
│  ┌──────────────────────┴──────────────────────────┐  │
│  │  Soroban Smart Contracts (Rust → WASM)           │  │
│  │                                                   │  │
│  │  ┌─────────────────────┐  ┌────────────────────┐ │  │
│  │  │  arisan-contract     │  │  yield-vault        │ │  │
│  │  │  Core ROSCA pool     │  │  40% yield vault    │ │  │
│  │  │  ~1240 lines         │  │  ~242 lines         │ │  │
│  │  │                      │  │                     │ │  │
│  │  │  create_pool()       │  │  init()             │ │  │
│  │  │  join()              │  │  set_token()        │ │  │
│  │  │  start_pool()        │  │  register_participant│ │  │
│  │  │  contribute()        │  │  annual_gacha()     │ │  │
│  │  │  select_winner()      │  │  receive_yield()    │ │  │
│  │  │  claim_winner_payout()│  │  get_state()        │ │  │
│  │  │  claim_final()       │  │                     │ │  │
│  │  │  harvest_yield()     │  └────────────────────┘ │  │
│  │  │  distribute_collateral_yield()                 │  │
│  │  │  slash_collateral()  │                         │  │
│  │  │  pause/unpause()     │  ┌────────────────────┐ │  │
│  │  └─────────────────────┘  │  artel-factory      │ │  │
│  │                            │  (DEPRECATED)      │ │  │
│  │  ┌─────────────────────┐  └────────────────────┘ │  │
│  │  │  Blend Protocol      │                         │  │
│  │  │  (planned, not live) │  ┌────────────────────┐ │  │
│  │  └─────────────────────┘  │  artel-faucet       │ │  │
│  │                            │  (unused)           │ │  │
│  └────────────────────────────┴────────────────────┘ │  │
└───────────────────────────────────────────────────────┘
```

---

## Pool Lifecycle State Machine

```
┌──────────┐   start_pool    ┌──────────┐   select_winner   ┌───────────┐
│ PENDING  │ ──────────────► │  ACTIVE  │ ────────────────► │ COMPLETED │
│ (open)   │                 │          │  (N kali, sampai  │           │
│          │                 │  ┌─────┐ │   current_round>  │           │
│  join()  │                 │  │loop │ │   total_rounds)   │           │
│  exit()  │                 │  └─────┘ │                   │           │
└──────────┘                 └──────────┘                   └───────────┘
                                 │                                │
                          contribute()                  claim_winner_payout()
                          slash_collateral()            claim_final()
                          deposit_yield()               disburse_pool_yield_gacha()
                          harvest_yield()
```

### State Transitions
| From | Action | To | Who |
|------|--------|----|-----|
| Pending | `start_pool()` | Active | Admin only |
| Active | `select_winner()` → `current_round > total_rounds` | Completed | Admin only |
| Active | `select_winner()` → masih ada ronde | Active | Admin only |

---

## Contract Architecture: 1 Contract → Many Pools

Model **Sui-style**: semua pool hidup dalam SATU kontrak arisan, bukan deploy kontrak baru per pool.

```
Storage Key: (Symbol("pool"), pool_id: u32) → Pool struct
```

Ini lebih hemat gas daripada model "1 pool = 1 contract".

### `pool_id` vs Contract Address
- `pool_id` = **angka urut** (0, 1, 2, ...) di dalam kontrak arisan
- URL `/dapp/pools/1` = pool ke-2 (index dari 0)
- **BUKAN** contract address. Contract address selalu `C...` format

---

## Data Flow: Frontend ↔ Contract

```
User click "Deposit" → useFreighterTx.invokeContract()
    → TransactionBuilder → simulate → Freighter sign → sendTransaction
    → waitForTx (polling) → result.hash → refreshAll() → re-fetch state
```

### API Routes (Next.js)
| Route | Purpose | Risk |
|-------|---------|------|
| `/api/pools` | `get_pool_count` | Read-only simulation |
| `/api/contract-state` | View functions: state, config, member info, leaderboard | Read-only, fn allowlist |
| `/api/faucet` | Friendbot proxy | Rate-limited by Friendbot |
| `/api/rpc` | Soroban RPC proxy (UNUSED) | Method allowlist |

### Wallet Flow
```
WalletContext.connect() → getPubKey(per walletType) → set address
useFreighterTx.invokeContract():
  1. Get pubKey from WalletContext
  2. rpc.getAccount(pubKey) — build transaction
  3. rpc.simulateTransaction(tx) — validate
  4. rpc.assembleTransaction(tx, sim) — prepare
  5. signXdr(per walletType) — user signs via extension
  6. rpc.sendTransaction(signed) — submit to chain
  7. waitForTx(hash) — poll until SUCCESS
```

---

## Blend Protocol Integration (Status)

**Status: BELUM LIVE — planned, framework exists.**

```
arisan-contract ──blend_supply()──► Blend Pool Contract (not connected)
                 ──blend_withdraw()► (no-op — empty function body)

harvest_yield(): admin manually deposits yield → distributes 75% members / 25% gacha
```

Fungsi `blend_supply` & `blend_withdraw` saat ini **no-op** (kondisional dengan Blend belum terdeploy).
Integrasi penuh butuh:
1. Blend Pool address yang valid di testnet
2. Import Blend SDK (`@blend-capital/blend-contract-sdk`)
3. Implementasi `submit(SupplyCollateral)` / `submit(WithdrawCollateral)` di kontrak
4. Testing end-to-end

---

## 🆕 Blend Protocol Integration (Live)

```
arisan-contract ──blend_supply()──► Blend Pool (TestnetV2)
                 ──blend_withdraw()► CCEBVDYM...
                 ──harvest_blend_yield()──► balance_before/after tracking

JOIN/CREATE:  member → ARTEL → blend_supply(submit(SupplyCollateral)) → Blend
CLAIM_FINAL:  ARTEL ← blend_withdraw(submit(WithdrawCollateral)) ← Blend
HARVEST:      withdraw 7.5B → re-supply 7.5B → yield = balance_after - balance_before
```

### Auth Pattern
```
User sign → ARTEL.invoke_contract(Blend, "submit", args)
  → authorize_as_current_contract([Blend.submit, XLM.transfer])
  → Blend checks spender.require_auth() → ARTEL in auth tree ✓
```

### New Functions
| Function | Location | Purpose |
|----------|----------|---------|
| `blend_supply()` | lib.rs | Supply collateral to Blend via submit |
| `blend_withdraw()` | lib.rs | Withdraw collateral from Blend |
| `harvest_blend_yield()` | lib.rs | Withdraw+resupply, track yield, distribute 75/25 |
| `BlendRequest` | lib.rs | Struct matching Blend's Request ABI |
| `BlendPositions` | lib.rs | Struct matching Blend's Positions (for future get_positions) |
