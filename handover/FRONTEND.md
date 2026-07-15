# 🎨 ARTEL — Frontend Documentation

## Halaman

### Landing Page (`/`)

7-section storytelling page:
| Section | Component | Content |
|---------|-----------|---------|
| Hero | inline | Title, stats, ticker, CTA |
| Akar | `Akar` | Global ROSCA history |
| Percikan | `Percikan` | Spark intro |
| Retakan | `Retakan` | Pain points |
| Tempaan | `Tempaan` | Collateral solution |
| Nyala | `Nyala` | Triple Yield |
| Sistem | `Sistem` | How it works |
| Galeri | `Galeri` | Features grid |
| Bukti | `Bukti` | Proof/comparison |
| CTA | `Cta` | Launch + GitHub links |
| Footer | landing footer | Links, copyright |

### dApp Pages (11 halaman)

| Route | Page | Fungsi |
|-------|------|--------|
| `/dapp/pools` | pools/page.tsx | Listing pool + filter |
| `/dapp/pools/[id]` | pools/[id]/page.tsx | Detail pool + actions |
| `/dapp/create` | create/page.tsx | Form buat pool baru |
| `/dapp/yield` | yield/page.tsx | Dashboard yield |
| `/dapp/simulator` | simulator/page.tsx | ROSCA simulator |
| `/dapp/leaderboard` | leaderboard/page.tsx | Ranking member |
| `/dapp/profile` | profile/page.tsx | Profil member |
| `/dapp/faq` | faq/page.tsx | FAQ pertanyaan |
| `/dapp/faucet` | faucet/page.tsx | Klaim testnet XLM |
| `/dapp/dashboard` | dashboard/page.tsx | Dashboard user |
| `/dapp/gacha` | gacha/page.tsx | Info gacha vault |

## Key Hooks

### `useWallet()` — Multi-wallet
```typescript
const { address, walletType, connecting, connect, disconnect } = useWallet();
// connect("freighter" | "albedo" | "xbull" | "lobstr")
```

### `useFreighterTx()` — Contract invocation
```typescript
const { loading, error, txHash, invokeContract } = useFreighterTx();
const result = await invokeContract(CONTRACT_IDS.pool, "contribute", [scvU32(0), scvAddress(address)]);
```

### `useDict()` — i18n
```typescript
const { dapp } = useDict();
<h1>{dapp.pools.title}</h1>
```

### `useLocale()` — Language control
```typescript
const { locale, toggle } = useLocale();
// locale: "en" | "id"
```

## Key Components

### Buttons
```typescript
BTN_PRIMARY   // Blue primary
BTN_ORANGE    // Orange action
BTN_SUCCESS   // Green success
// Di pools/[id]/page.tsx
```

### ArtelHeader
```typescript
CARD_CLASS    // Card styling
LABEL_MONO    // Monospace label style
HEADING_FONT  // Heading font (Bebas Neue)
BarcodeStrip  // Decorative element
```

## Wallet Integration

### Freighter
```typescript
import { isConnected, requestAccess, getAddress, signTransaction } from "@stellar/freighter-api";
// Connect flow:
// 1. await requestAccess() → prompts user in popup
// 2. await getAddress() → returns { address: "G..." }
// 3. await signTransaction(txXdr, opts) → returns signed XDR
```

### Error Map
```typescript
const ERROR_MAP: [RegExp, string][] = [
  [/no new yield/i, "Belum ada yield baru..."],
  [/pool not active/i, "Pool belum aktif..."],
  [/not enough balance/i, "Saldo tidak mencukupi..."],
  [/already a member/i, "Kamu sudah tergabung..."],
  // ... 30+ patterns
];
```

## i18n Keys Structure

```typescript
dapp: {
  nav: { pools, simulator, leaderboard, yield_, profile, faq, faucet, dashboard, gacha, create },
  shared: { connect, disconnect, connecting, back, share, search, prev, next, noData, close, notice, roscoProtocol },
  status: { active, ready, open_, completed, pending },
  pools: { title, all, filterActive, filterReady, filterOpen, filterCompleted, members, deposit, cycle, state, view, poolFunds, noPools },
  poolDetail: { ... 40+ keys },
  yield_: { ... 30+ keys },
  create: { ... 10 keys },
  simulator: { ... },
  leaderboard: { ... },
  profile: { ... },
  faq: { ... },
  faucet: { ... },
  dashboard: { ... },
  gacha: { ... },
}
```

## Error Handling Pattern

```typescript
// Di pools/[id]/page.tsx
const runTx = async (method: string, args: xdr.ScVal[]) => {
  const result = await invokeContract(CONTRACT_IDS.pool, method, args);
  if (result?.success) await refreshAll();
  return result;
};

// Auto-maps contract errors to Bahasa Indonesia via ERROR_MAP
```
