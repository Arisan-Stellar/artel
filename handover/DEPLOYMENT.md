# 🚀 ARTEL — Deployment

## Active Contracts (Stellar Testnet)

| Contract | Address | Admin |
|----------|---------|-------|
| **arisan** | `CBDJOVCVXHMMBP7E7IPBPTZHCKFB277R7QXBEDSIGCNZHYI3VYCOSO5O` | `GAAA6ZHLYVEK57LIWBOPODU3VPGZXKO6GMQMR2JPEPDHX4R374NN2MTJ` |
| **vault** | `CAW77FMNIHKNCPU6WTFCA7VF42WS3JU5DUXBKZWELGARJ5E6DMYNFW5V` | `GAAA6ZHLYVEK57LIWBOPODU3VPGZXKO6GMQMR2JPEPDHX4R374NN2MTJ` |
| **XLM** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` | SAC native |

> **Catatan:** `pool_id` = angka urut (0, 1, 2...), BUKAN contract address.
> Semua pool hidup dalam 1 kontrak arisan.

---

## Admin Key

| | Value |
|---|---|
| **Pubkey** | `GAAA6ZHLYVEK57LIWBOPODU3VPGZXKO6GMQMR2JPEPDHX4R374NN2MTJ` |
| **Secret** | `SBEVWHZU...` — HANYA di `frontend/.env.local` (gitignored) |
| **Keystore** | `~/.config/stellar/identity/artel-admin-v2.toml` |

> ⚠️ **Secret ini dipakai buat deploy contract + admin functions. JANGAN dishare ke siapapun. JANGAN masukin ke Vercel.**

---

## Environment Variables

### Local Development (`frontend/.env.local` — gitignored)

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_CONTRACT_POOL=CBDJOVCVXHMMBP7E7IPBPTZHCKFB277R7QXBEDSIGCNZHYI3VYCOSO5O
NEXT_PUBLIC_CONTRACT_VAULT=CAW77FMNIHKNCPU6WTFCA7VF42WS3JU5DUXBKZWELGARJ5E6DMYNFW5V
NEXT_PUBLIC_XLM_CONTRACT=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
DEPLOYER_SECRET=SBEVWHZUVZQLVCMW2C3ES7CO22CUJK4TAZQQBNIQFDNORVFW3BAN42GW
```

### Vercel (production — set di Vercel Dashboard)

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_CONTRACT_POOL=CBDJOVCVXHMMBP7E7IPBPTZHCKFB277R7QXBEDSIGCNZHYI3VYCOSO5O
NEXT_PUBLIC_CONTRACT_VAULT=CAW77FMNIHKNCPU6WTFCA7VF42WS3JU5DUXBKZWELGARJ5E6DMYNFW5V
NEXT_PUBLIC_XLM_CONTRACT=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

> **HANYA `NEXT_PUBLIC_*` vars — jangan ada `DEPLOYER_SECRET` di Vercel!**

### Vercel Settings
- **Root Directory:** `frontend`
- **Framework:** Next.js
- **Build Command:** `npm run build` (default)
- **Install Command:** `npm ci` (default)

---

## Deploy Flow (kalau ganti kontrak)

```bash
# 1. Build
cd contracts
cargo test                           # pastikan semua pass
stellar contract build               # build wasm

# 2. Deploy arisan
ARISAN=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/arisan_contract.wasm \
  --source artel-admin-v2 --network testnet | tail -1)

# 3. Deploy vault
VAULT=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/yield_vault.wasm \
  --source artel-admin-v2 --network testnet | tail -1)

# 4. Init vault
stellar contract invoke --id $VAULT --source artel-admin-v2 --network testnet \
  -- init --admin GAAA6ZHLYVEK57LIWBOPODU3VPGZXKO6GMQMR2JPEPDHX4R374NN2MTJ

stellar contract invoke --id $VAULT --source artel-admin-v2 --network testnet \
  -- set_token --token_addr CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

# 5. Update config
# Frontend:
#   - frontend/.env.local (NEXT_PUBLIC_CONTRACT_POOL, NEXT_PUBLIC_CONTRACT_VAULT)
#   - frontend/.env.example
#   - frontend/lib/artel-sdk.ts (fallback addresses)
#   - frontend/bindings/arisan-pool/src/index.ts (contractId)
# Docs:
#   - All update-faiz/*.md, handover/*
```

---

## Repo Setup

### Origin (org repo)
```
git remote -v
# origin  https://github.com/Arisan-Stellar/artel.git
# Branch: faiz (kerja) → PR ke main
```

### Personal (testing Vercel)
```
git remote add personal https://github.com/Faiz-abdurrachman/artel.git
git push personal faiz:main    # Push ke personal untuk Vercel deploy
```
