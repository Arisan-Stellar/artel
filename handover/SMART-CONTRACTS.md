# 📜 ARTEL — Smart Contracts Documentation

## Contract 1: arisan-contract (Core)

**File:** `contracts/arisan-contract/src/lib.rs` (~1311 lines)
**Deployed:** `CBVWEPXBBCPAK2A3NCCKIP6ORYB32VH3OKRQBUWNSMONQC5KEORPEQSN`

### Types

```rust
enum ArisanState { Pending, Active, Completed }

struct ArisanConfig {
    name: String, contribution_amount: i128, collateral_ratio_bps: u32,
    token: Address, max_members: u32, round_duration: u64,
    slash_grace_period: u64, min_reputation: u32, admin_fee_bps: u32,
    early_points: u32, mid_points: u32, late_penalty: i32, blend_address: Address,
}

struct MemberInfo {
    address: Address, collateral_amount: i128, total_contributed: i128,
    missed_payments: u32, has_won: bool, is_active: bool,
    joined_at: u64, last_deposit_round: u32, deposited_this_round: bool,
    early_payments: u32, mid_payments: u32, late_payments: u32,
    total_points: i32, current_streak: u32, yield_earned: i128,
    gacha_claimed: bool, pending_winner_payout: i128, winner_payout_claimed: bool,
}

struct Pool {
    config: ArisanConfig, admin: Address, yield_vault: Address,
    state: ArisanState, current_round: u32, total_rounds: u32,
    round_start_time: u64, pool_start_time: u64, is_full: bool,
    members: Map<Address, MemberInfo>, member_list: Vec<Address>,
    active_depositors_count: u32, round_winners: Map<u32, Address>,
    collateral_balance: i128, pool_funds_balance: i128,
    winner_payout_balance: i128, yield_balance: i128,
    collateral_yield_balance: i128, col_yield_dist: i128,
    paused: bool, blend_btoken_balance: i128,
    end_period_gacha_balance: i128, last_harvest_time: u64,
}
```

### Functions

| Fungsi | Auth | Description |
|--------|------|-------------|
| `create_pool(admin, vault, config)` | admin | Buat pool + admin auto-join |
| `join(pool_id, member)` | member | Join dengan all-in payment |
| `exit(pool_id, member)` | member | Keluar sebelum pool mulai |
| `start_pool(pool_id)` | admin | Mulai pool (harus full) |
| `contribute(pool_id, member)` | member | Bayar iuran bulanan |
| `slash_collateral(pool_id, defaulter)` | admin | Hukum member mangkir |
| `select_winner(pool_id)` | admin | Pilih pemenang acak |
| `claim_winner_payout(pool_id, winner)` | winner | Klaim hadiah menang |
| `claim_final(pool_id, member)` | member | Klaim collateral + yield akhir |
| `disburse_pool_yield_gacha(pool_id)` | admin | Distribusi gacha pool |
| `harvest_blend_yield(pool_id)` | admin | Panen yield dari Blend |
| `pause(pool_id)` | admin | Pause pool (darurat) |
| `unpause(pool_id)` | admin | Unpause pool |
| `get_state(pool_id)` | public | Baca state pool |
| `get_member_info(pool_id, member)` | public | Baca info member |
| `get_admin(pool_id)` | public | Baca admin address |
| `get_config(pool_id)` | public | Baca konfigurasi pool |
| `get_leaderboard(pool_id)` | public | Baca peringkat member |
| `get_tickets(pool_id, member)` | public | Baca tiket member |
| `get_round_winner(pool_id, round)` | public | Baca pemenang ronde |
| `get_pool_count()` | public | Baca jumlah pool |

### Key Business Logic

#### Fair ROSCA Net-Zero
```rust
// Contoh: pool 3 member, 10 XLM/cycle, 125% collateral
// All-in Join: 12.5 XLM (collateral) + 10 XLM (cycle-1) = 22.5 XLM
// Total contribution per member = 3 cycles × 10 XLM = 30 XLM
// Total paid total = 12.5 + 30 = 42.5 XLM
// Final claim = 12.5 (collateral) + 30 (payout received as winner) = 42.5 XLM
// Net: 0 ✅
```

#### Compute Tickets
```rust
fn compute_tickets(info: &MemberInfo) -> u32 {
    let base = info.early_payments * 3 + info.mid_payments;
    let multiplier = match info.current_streak {
        0..=2   => 100,
        3..=4   => 110,
        5..=7   => 150,
        8..=10  => 180,
        _       => 200, // 2x multiplier for 11+ streak
    };
    1 + (base * multiplier / 100)
}
```

#### Randomness
```rust
fn derive_seed(env: &Env, salt: u64) -> u64 {
    (ledger.sequence() as u64)
        .wrapping_mul(ledger.timestamp())
        .wrapping_add(salt)
        .wrapping_add(nonce)  // multiplicative nonce for entropy
}
```

## Contract 2: yield-vault (Gacha)

**File:** `contracts/yield-vault/src/lib.rs` (~242 lines)
**Deployed:** `CA65HU7KGU4EU4DGQYEQCCUBHAHFW6BOGCOKVRIIYGOOSYLSDH5WLIR7`

### Functions

| Fungsi | Auth | Description |
|--------|------|-------------|
| `init(admin)` | - | Init vault dengan admin |
| `set_token(token)` | admin | Set token address |
| `receive_yield(from, amount)` | from | Terima yield dari arisan |
| `register_participant(arisan, participant, tickets)` | arisan | Daftar peserta gacha |
| `annual_gacha()` | admin | Eksekusi undian tahunan |
| `reset_for_new_year()` | admin | Reset gacha lock |
| `get_state()` | public | Baca state vault |
| `get_participant_count()` | public | Baca jumlah peserta |

### Gacha Logic

```rust
pub fn annual_gacha(env: Env) -> Vec<GachaWinner> {
    // 1. Check annual window (June-July)
    // 2. Weighted random selection
    // 3. Prize tiers: Grand (50%), Runner (15% × 2), Consolation (20% / rest)
    // 4. Transfer prizes
    // 5. Lock for the year
}
```

## Contract 3: artel-factory

**File:** `contracts/artel-factory/src/lib.rs` (~113 lines)
**Status:** ⚠️ Tidak digunakan — arsitektur 1 contract → many pools
**Address:** N/A (not deployed in current architecture)

## Contract 4: artel-faucet

**File:** `contracts/artel-faucet/src/lib.rs` (~66 lines)
**Status:** Tidak dipakai di frontend (faucet via friendbot / /dapp/faucet page)
**Address:** N/A
