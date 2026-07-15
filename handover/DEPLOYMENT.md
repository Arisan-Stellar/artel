# 🚀 ARTEL — Deployment Guide

## Active Contracts (Testnet)

| Contract | Address | Keterangan |
|----------|---------|------------|
| **arisan** | `CBVWEPXBBCPAK2A3NCCKIP6ORYB32VH3OKRQBUWNSMONQC5KEORPEQSN` | Vault wire deployed |
| **vault** | `CA65HU7KGU4EU4DGQYEQCCUBHAHFW6BOGCOKVRIIYGOOSYLSDH5WLIR7` | Cross-contract auth ready |
| **XLM SAC** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` | Native asset |
| **Blend Pool** | `CCEBVDYM32YNYCVNRXQKDFFPISJJCV557CDZEIRBEE4NCV4KHPQ44HGF` | TestnetV2 |

## Admin Key

```bash
# Cek pubkey
stellar keys address artel-admin-v2
# → GAAA6ZHLYVEK57LIWBOPODU3VPGZXKO6GMQMR2JPEPDHX4R374NN2MTJ
```

Secret ada di `frontend/.env.local` — **gitignored, jangan commit!**

## Deploy Flow

```bash
# 1. Build
cd contracts
cargo test
stellar contract build

# 2. Deploy vault dulu
VAULT=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/yield_vault.wasm \
  --source artel-admin-v2 \
  --network testnet)

# 3. Init vault
stellar contract invoke --id $VAULT --source artel-admin-v2 --network testnet \
  -- init --admin $(stellar keys address artel-admin-v2)
stellar contract invoke --id $VAULT --source artel-admin-v2 --network testnet \
  -- set_token --token_addr CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

# 4. Deploy arisan
ARISAN=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/arisan_contract.wasm \
  --source artel-admin-v2 \
  --network testnet)

# 5. Update .env.local, .env.example, artel-sdk.ts dengan address baru
```

## Vercel Setup

### Root Directory: `frontend/`

### Environment Variables

Tempelin ini di Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_CONTRACT_POOL=CBVWEPXBBCPAK2A3NCCKIP6ORYB32VH3OKRQBUWNSMONQC5KEORPEQSN
NEXT_PUBLIC_CONTRACT_VAULT=CA65HU7KGU4EU4DGQYEQCCUBHAHFW6BOGCOKVRIIYGOOSYLSDH5WLIR7
NEXT_PUBLIC_XLM_CONTRACT=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
NEXT_PUBLIC_CONTRACT_BLEND=CCEBVDYM32YNYCVNRXQKDFFPISJJCV557CDZEIRBEE4NCV4KHPQ44HGF
```

Semua optional — fallback udah di `artel-sdk.ts`. Tapi recommended diset semua.

## Pool Demo (Seeded)

| Pool | Name | State | Detail |
|------|------|-------|--------|
| 0 | E2E Blend | Active (round 2) | 3 member, 75 XLM collateral |
| 1 | Micro Arisan | Active | 3 member, 37.5 XLM collateral |
| 2 | Premium Circle | Pending | 3 member (↑), 750 XLM collateral |
| 3 | (new) | Created by user | - |

## Testing

```bash
# Contracts
cd contracts && cargo test && stellar contract build

# Frontend type + lint
cd frontend && npx tsc --noEmit && npx eslint . --quiet

# E2E (butuh dev server running)
cd frontend && npx playwright test --project=chromium

# Full E2E with Freighter (extension required)
cd frontend && npx playwright test --project=freighter
```
