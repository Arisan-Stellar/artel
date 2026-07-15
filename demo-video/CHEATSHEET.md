# ⚡ Demo Cheatsheet

## Contract Addresses

| Contract | Address |
|----------|---------|
| arisan | `CBVWEPXBBCPAK2A3NCCKIP6ORYB32VH3OKRQBUWNSMONQC5KEORPEQSN` |
| vault | `CA65HU7KGU4EU4DGQYEQCCUBHAHFW6BOGCOKVRIIYGOOSYLSDH5WLIR7` |
| XLM | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Blend Pool | `CCEBVDYM32YNYCVNRXQKDFFPISJJCV557CDZEIRBEE4NCV4KHPQ44HGF` |
| Stellar Expert | `https://stellar.expert/explorer/testnet/contract/CCEBVDYM...` |

## Wallet Info

| Wallet | Address | Notes |
|--------|---------|-------|
| **A (Admin)** | `GB52R7L4UAEOOEPD4RWTPOU3KFBL6UWT2XOOZWN26T7LSWBBYU4BSTQA` | Create pool, start, harvest |
| **B** | generate dari Freighter | Join, contribute |
| **C** | generate dari Freighter | Join, contribute |

> **Freighter Password:** `Faizfaiz01073`

## Wallet Switch Steps (Freighter)

1. Klik ikon Freighter di browser
2. Klik avatar/icon → "Switch Account"
3. Pilih wallet yang diinginkan
4. Balik ke tab ARTEL

## Web URLs

| Halaman | URL |
|---------|-----|
| Landing | `http://localhost:3000` |
| Pools | `http://localhost:3000/dapp/pools` |
| Create Pool | `http://localhost:3000/dapp/create` |
| Pool Detail | `http://localhost:3000/dapp/pools/0` |
| Yield | `http://localhost:3000/dapp/yield` |
| Gacha | `http://localhost:3000/dapp/gacha` |
| Faucet | `http://localhost:3000/dapp/faucet` |

## CLI Commands (kalo perlu)

```bash
# Cek pool state (read-only, no sign)
stellar contract invoke \
  --id CBVWEPXBBCPAK2A3NCCKIP6ORYB32VH3OKRQBUWNSMONQC5KEORPEQSN \
  --source-account GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF \
  --network testnet \
  -- get_state --pool_id 0

# Harvest yield (admin only)
stellar contract invoke \
  --id CBVWEPXBBCPAK2A3NCCKIP6ORYB32VH3OKRQBUWNSMONQC5KEORPEQSN \
  --source-account artel-admin-v2 \
  --network testnet \
  -- harvest_blend_yield --pool_id 0

# Friendbot (fund test account)
curl -s "https://friendbot.stellar.org?addr=<ADDRESS>"
```

## Poin Penting Demo

| Item | Value |
|------|-------|
| Max contribution | 25 XLM |
| Max members demo | 3 (biar cepet) |
| Round duration | 5 menit (testing) / 1 bulan (real) |
| Collateral ratio | 125% |
| Fee | 0% |
| Network | Testnet |
| Yield split | 75% member / 25% gacha |

## Skip Checklist

- [ ] 3 wallet Freighter terdaftar
- [ ] Semua wallet punya ≥100 XLM
- [ ] Dev server jalan (`cd frontend && npm run dev`)
- [ ] Tab lain ditutup
- [ ] Notifikasi desktop dimatiin
- [ ] Screen recorder siap (1920×1080, 60fps)
- [ ] Highlight mouse aktif
- [ ] Script di cetak / monitor kedua
