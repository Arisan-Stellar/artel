# 🎬 ARTEL — Demo Video Production Kit

## 📁 Folder Structure

| File | Isi |
|------|-----|
| `README.md` | Overview + checklist persiapan |
| `SCRIPT.md` | **Full script** EN (voiceover) + ID (subtitle) side-by-side |
| `SHOTLIST.md` | **Technical shot list** — visual, timing, wallet switch |
| `FLOW.md` | **E2E flow** — wallet setup, pool lifecycle, CLI commands |
| `CHEATSHEET.md` | **Quick reference** — wallet addresses, contract IDs, shortcuts |

## ⏱️ Durasi Total: ~4 menit

| Babak | Scene | Durasi |
|-------|-------|--------|
| 1 | Landing Page | 20s |
| 2 | Connect Wallet | 15s |
| 3 | Create Pool | 25s |
| 4 | Join Pool | 20s |
| 5 | Start + Select Winner | 20s |
| 6 | Contribute + Claim | 25s |
| 7 | Yield & Harvest ⭐ | 45s |
| 8 | Gacha Vault | 20s |
| 9 | Claim Final | 20s |
| 10 | On-Chain Verification | 20s |
| 11 | CTA + Closing | 10s |
| | **Total** | **~4 menit** |

## ✅ Persiapan Sebelum Rekam

### Wallet
| Wallet | Address | Fungsi |
|--------|---------|--------|
| A (Admin) | `GB52R7L4UAEOOEPD4RWTPOU3KFBL6UWT2XOOZWN26T7LSWBBYU4BSTQA` | Buat pool, start, harvest |
| B | (generate baru) | Join, contribute |
| C | (generate baru) | Join, contribute |

> Semua pake password: `Faizfaiz01073`

### Saldo
- Tiap wallet minimal **100 XLM**
- Claim dari faucet di `/dapp/faucet` atau via friendbot:
  ```bash
  curl -s "https://friendbot.stellar.org?addr=<ADDRESS>"
  ```

### Browser
- Chrome/Chromium
- Freighter extension terinstall + 3 akun terdaftar
- Network: **Testnet**
- Tutup tab lain, matiin notifikasi

### Recording
- Resolusi: **1920×1080, 60fps**
- Audio: Mic jelas, volume stabil
- Mouse: aktifkan highlight click
- Capture: full screen (bukan tab aja)
