# 🔄 E2E Demo Flow — Step by Step

## Phase 1: Setup (sebelum rekam)

```bash
# 1. Generate wallet B dan C
stellar keys generate demo-b --network testnet
stellar keys generate demo-c --network testnet

# 2. Fund mereka
curl -s "https://friendbot.stellar.org?addr=$(stellar keys address demo-b)"
curl -s "https://friendbot.stellar.org?addr=$(stellar keys address demo-c)"

# 3. Import ke Freighter (manual):
#    - Buka Freighter → Add Account → Import Secret Key
#    - Import key dari `stellar keys show demo-b`
#    - Import key dari `stellar keys show demo-c`
#    - Password semua: Faizfaiz01073

# 4. Start dev server
cd frontend && npm run dev
```

## Phase 2: Rekam (ikuti SCRIPT.md + SHOTLIST.md)

**Ringkasan flow:**
1. Landing page → intro
2. Scroll sections → problem + solution  
3. Launch App → connect wallet A
4. Create pool → "Demo Arisan Q3" (25 XLM, 3 max)
5. Wallet B join
6. Wallet C join
7. Wallet A: Start Pool
8. Wallet A: Select Winner
9. Wallet B: Deposit (round 2)
10. Yield page overview
11. Harvest (optional)
12. Gacha page
13. Stellar Expert verification
14. Back to landing → CTA

## Phase 3: Jika Ada Error

| Error | Fix |
|-------|-----|
| "Freighter not detected" | Refresh halaman, cek extension |
| Transaction failed | Cek saldo, cek network testnet |
| Pool not starting | Pastikan semua member udah join |
| Blank page | `npm run dev` masih jalan? |
| ESLint error | Jangan di-rekam, fix dulu |

## Phase 4: Selesai Rekam

1. Simpan video sebagai `artel-demo-v1.mp4`
2. Upload ke YouTube / Google Drive
3. Share link ke tim
