# 🖥️ ARTEL — Frontend Guide

## Pages & Routes

| Route | Page | Type | Description |
|-------|------|------|-------------|
| `/` | Landing page | Static | 7-section storytelling landing |
| `/dapp/pools` | Pool list | Static (CSR fetch) | List semua pool dari chain, filter (ALL/OPEN/ACTIVE/COMPLETED), WalletCard |
| `/dapp/pools/[id]` | Pool detail | Dynamic | Detail pool, buttons (Join/Deposit/Start/Select/Claim), participants, yield stats |
| `/dapp/create` | Create pool | Static (CSR) | Form: name, deposit, max members → deploy via Freighter |
| `/dapp/dashboard` | Dashboard | Static (CSR) | User's pools, points, tickets |
| `/dapp/profile` | Profile | Static (CSR) | On-chain reputation, activity, badges |
| `/dapp/leaderboard` | Leaderboard | Static (CSR) | Cross-pool ranking |
| `/dapp/yield` | Yield dashboard | Static (CSR) | Blend stats, member yields (Edwin's PR) |
| `/dapp/gacha` | Gacha | Static | Gacha page |
| `/dapp/simulator` | Simulator | Static | Interactive ROSCA simulator |
| `/dapp/faq` | FAQ | Static | FAQ page |
| `/dapp/faucet` | Faucet | Static | Claim 10,000 testnet XLM |
| `/api/contract-state` | API | Dynamic | View function proxy to RPC |

---

## Key Components

### useFreighterTx (`hooks/useFreighterTx.ts`)
Hook utama untuk interaksi kontrak via browser wallet.

```typescript
const { loading, error, txHash, invokeContract } = useFreighterTx();

// Panggil kontrak
await invokeContract(CONTRACT_IDS.pool, "join", [scvU32(poolId), scvAddress(address)]);
```

**Flow:**
1. Dapatkan pubKey dari WalletContext
2. Build transaction → simulate → assemble → sign (via wallet extension) → send → poll
3. Return `{ hash, success }`

**Error Handling:**
- **ERROR_MAP** — ~25 pattern regex untuk menerjemahkan raw contract errors ke bahasa Indonesia
- Fallback: extract string dalam kutip, atau truncate 120 chars
- Semua error dari kontrak, wallet, atau jaringan Stellar di-mapping

### WalletContext (`hooks/WalletContext.tsx`)
Multi-wallet provider — unified interface untuk Freighter, Albedo, xBull, Lobstr.

```typescript
const { address, walletType, connecting, connect, disconnect } = useWallet();

connect()    // Pilih wallet (Freighter default) → getPublicKey
disconnect() // Reset state
```

### artel-sdk (`lib/artel-sdk.ts`)
Config + contract client.

```typescript
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "testnet";
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org";
export const CONTRACT_IDS = {
  pool: env_or("CAHJPUKI..."),  // Override via NEXT_PUBLIC_CONTRACT_POOL
  vault: env_or("CCBQFVC3..."),  // Override via NEXT_PUBLIC_CONTRACT_VAULT
  blend: env_or(""),            // Override via NEXT_PUBLIC_CONTRACT_BLEND
};
```

### poolMath (`lib/poolMath.ts`)
Perhitungan collateral, join cost, contribution.

```typescript
getRequiredCollateralFromConfig(config) // Collateral dari config (125% default)
getJoinCostFromConfig(config)          // Collateral + contribution (all-in join)
getContributionFromConfig(config)      // Iuran per ronde
```

---

## Pool Detail Page Flow ([id]/page.tsx)

Halaman paling kompleks. Berikut flow button-nya:

```
Connect wallet?
    → NO: prompt connect
    → YES: check state

State mapping:
    Pending + is_full   = "ready"
    Pending + !is_full  = "open"
    Active              = "active"
    Completed           = "completed"

Buttons (conditional):
    canJoin       = open && !participant && !full && hasAddress
    canStart      = ready && isAdmin
    canDeposit    = active && participant && !hasPaid
    canSelect     = active && isAdmin
    canClaimPayout = participant && pendingPayout > 0 && !claimed
    canClaimFinal  = completed && participant && !claimed
    canDrawGacha   = completed && isAdmin && yieldCumulative > 0
```

### Display Fixes (applied)
| Fix | Before | After |
|-----|--------|-------|
| **FUNDS** | `deposit * members` (salah) | `pool_funds_balance` dari chain (akurat) |
| **Participant badges** | `paid: false, won: false` (hardcode) | Fetch `get_member_info` per participant |
| **Tickets** | `6` (hardcode) | `get_tickets` untuk connected member |
| **cycleDays** | `30` (hardcode) | `round_duration / 86400` dari config |
| **Claim Final btn** | Muncul pas active pool (confusing) | Hanya Completed |
| **Draw Gacha btn** | Selalu muncul | Hanya Completed + admin + yield > 0 |
| **Error messages** | Raw VM errors | Bahasa Indonesia user-friendly |
| **Filter tabs** | `#888` on black (low contrast) | `#bbb` (inactive), `#fff` (hover) |

---

## Design System
- **Colors:** `--color-artel` (gold kunyit), `--color-teal: #14b8a6`, `--color-sui`, `--color-crack`
- **Cards:** Brutalist style — `border-[3px] border-[#0a0a0a] shadow-[5px_5px_0_#0a0a0a]`
- **Fonts:** Bebas Neue (headings), Inter (body), Space Grotesk (numbers)
- **Tabs:** Neo-brutalist — sliding indicator, radio buttons, CSS-only
- **Badges:** AnimatedBadge component — letter-by-letter flip on hover

---

## 🆕 Updates (July 2026)

### Yield Page Overhaul
| Change | Before | After |
|--------|--------|-------|
| Harvest button | Simulation mode (bypass) | Real `harvest_blend_yield` via `useFreighterTx` |
| Blend info | "Simulation Info" banner | Live Blend link to stellar.expert |
| ESLint | 5 errors | 0 errors |
| Data source | Mocked | Real `blend_btoken_balance` from chain |

### Pool Detail Page
- `blendStaked` now shows real Blend collateral values (was always 0)
- No data format changes needed

### Create Pool Page
- `blend_address` fixed: was `XLM_CONTRACT`, now `CONTRACT_IDS.blend`

### Mobile Responsive
- Hamburger menu (Menu/X toggle) added to `dapp/layout.tsx`
- Slide-down nav with all 7 dApp routes
- Active state highlighting on mobile

### New Error Mappings
- `no new yield to distribute` → "Belum ada yield baru yang bisa dibagikan"
- `no Blend collateral to harvest` → handled by assertion
