# 🛠️ ARTEL — Tech Stack

## Layer 1: Blockchain

| Item | Value |
|------|-------|
| **Network** | Stellar Testnet |
| **RPC** | `https://soroban-testnet.stellar.org` |
| **Horizon** | `https://horizon-testnet.stellar.org` |
| **Passphrase** | `Test SDF Network ; September 2015` |
| **Smart Contract Platform** | Soroban |
| **SDK** | `soroban-sdk 22.0.0` |
| **Target** | `wasm32v1-none` |

## Layer 2: Smart Contracts

| Contract | Rust | Lines | Fungsi |
|----------|------|-------|--------|
| arisan-contract | Rust + soroban-sdk 22.0.0 | 1311 | Core ROSCA pool (17 functions) |
| yield-vault | Rust + soroban-sdk 22.0.0 | 242 | Gacha vault (7 functions) |
| artel-factory | Rust + soroban-sdk 22.0.0 | 113 | Pool registry (3 functions) |
| artel-faucet | Rust + soroban-sdk 22.0.0 | 66 | Testnet faucet (3 functions) |

### Build Tools
- `cargo test` — run all tests
- `stellar contract build` — build wasm
- Rust target: `wasm32v1-none`

## Layer 3: Frontend

| Library | Version | Digunakan Untuk |
|---------|---------|-----------------|
| **Next.js** | 16.2.9 | Framework |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 4 | Styling |
| **Zustand** | 5 | State management |
| **TanStack React Query** | 5 | Data fetching |
| **GSAP** | 3.15 | Animasi landing page |
| **Lenis** | 1.3 | Smooth scroll |
| **SplitType** | 0.3 | Text splitting |

### Wallet Integrations

| Wallet | Package | API |
|--------|---------|-----|
| **Freighter** | `@stellar/freighter-api` v4 | `requestAccess()`, `getAddress()`, `signTransaction()` |
| **Albedo** | `@albedo-link/intent` | `publicKey()`, `signTransaction()` |
| **xBull** | `@creit.tech/xbull-wallet-connect` | `connect()`, `signTransaction()` |
| **Lobstr** | `@lobstrco/signer-extension-api` | `getPublicKey()`, `signTransaction()` |

### Stellar

| Package | Version | Digunakan Untuk |
|---------|---------|-----------------|
| `@stellar/stellar-sdk` | 14 | Transaction building, XDR parsing |
| `@creit.tech/stellar-wallets-kit` | 1 | Multi-wallet connector |

### Testing

| Tool | Version | Digunakan Untuk |
|------|---------|-----------------|
| **Playwright** | 1.61 | E2E browser tests (203 tests) |
| **Vitest** | 4.1 | Unit tests |
| **Testing Library** | 16.3 | React component tests |

### i18n

| File | Isi |
|------|-----|
| `lib/i18n/types.ts` | Type definitions for all keys |
| `lib/i18n/en.ts` | English dictionary |
| `lib/i18n/id.ts` | Bahasa Indonesia dictionary |
| `lib/i18n/LocaleProvider.tsx` | React context provider |
| `lib/i18n/dictionaries.ts` | Dictionary registry |

## Layer 4: Infrastructure

| Item | Value |
|------|-------|
| **Hosting** | Vercel (root dir = `frontend/`) |
| **CI/CD** | GitHub Actions (`.github/workflows/ci.yml`) |
| **Node version** | 22 |
| **Demo video** | `demo-video/` folder |

## Contract Auth Patterns

### Blend cross-contract auth (works)
```rust
env.authorize_as_current_contract(Vec::from_array(env, [
    InvokerContractAuthEntry::Contract(SubContractInvocation {
        context: ContractContext {
            contract: blend,
            fn_name: symbol_short!("submit"),
            args,
        },
        sub_invocations: Vec::new(env),
    }),
    // ... token transfer auth entry
]));
```

### Vault cross-contract auth (works — implemented 15 Juli)
```rust
env.authorize_as_current_contract(Vec::from_array(env, [
    InvokerContractAuthEntry::Contract(SubContractInvocation {
        context: ContractContext {
            contract: vault,
            fn_name: Symbol::new(&env, "register_participant"),
            args,
        },
        sub_invocations: Vec::new(env),
    }),
]));
```

### Token balance in contract context
```rust
let balance: i128 = env.invoke_contract(&token, &symbol_short!("balance"), vec![addr]);
```
