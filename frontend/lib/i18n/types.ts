export type Locale = "en" | "id";

export interface TimelineItem {
  day: string;
  label: string;
}

export interface FeatureItem {
  name: string;
  desc: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface Dict {
  nav: { launch: string };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleLead: string;
    lead: string;
    leadStrong: string;
    features: string;
    ctaPrimary: string;
    ctaSecondary: string;
    cardTitle: string;
    builtOn: string;
    live: string;
    stats: StatItem[];
    ticker: string[];
    scrollCue: string;
  };
  akar: { kicker: string; title: string; body: string; statValue: string; statLabel: string; facts: string[]; countries: { flag: string; name: string; local: string; fact: string }[] };
  percikan: { kicker: string; title: string; body: string; points: string[] };
  retakan: { kicker: string; title: string; body: string; problems: { label: string; desc: string; icon: string }[]; bridge: string };
  tempaan: {
    kicker: string;
    title: string;
    body: string;
    fleeLabel: string;
    safeLabel: string;
    formula: string;
  };
  nyala: {
    kicker: string;
    title: string;
    body: string;
    streamCollateral: string;
    streamDues: string;
    streamYield: string;
    apyLabel: string;
    apyLow: string;
    apyHigh: string;
  };
  sistem: {
    kicker: string;
    title: string;
    body: string;
    rules: string[];
    yieldOps: string;
    yieldShare: string;
    yieldVault: string;
    timeline: TimelineItem[];
  };
  galeri: {
    kicker: string;
    title: string;
    items: FeatureItem[];
  };
  bukti: {
    kicker: string;
    title: string;
    body: string;
    vsLabel: string;
    vsLabel2: string;
    items: { metric: string; artel: string; legacy: string; icon: string }[];
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
    secondaryButton: string;
    githubButton: string;
    trustLabel: string;
    trustLabel2: string;
    trustLabel3: string;
    contractLabel: string;
    contractArisan: string;
    contractVault: string;
    contractFactory: string;
    explorer: string;
    community: string;
  };
  landing: {
    footer: {
      tagline: string;
      blurb: string;
      productTitle: string;
      ecosystemTitle: string;
      communityTitle: string;
      deployed: string;
      event: string;
      rights: string;
      product: { label: string; href: string }[];
    };
  };
  dapp: {
    nav: { pools: string; simulator: string; leaderboard: string; yield_: string; profile: string; faq: string; faucet: string; dashboard: string; gacha: string; create: string };
    shared: { connect: string; disconnect: string; connecting: string; back: string; share: string; search: string; prev: string; next: string; noData: string; close: string; notice: string; roscoProtocol: string };
    status: { active: string; ready: string; open_: string; completed: string; pending: string };
    pools: { title: string; all: string; filterActive: string; filterReady: string; filterOpen: string; filterCompleted: string; members: string; deposit: string; cycle: string; state: string; view: string; poolFunds: string; noPools: string };
    poolDetail: {
      backToPools: string; stats: string; poolStats: string; progress: string;
      deposit: string; members: string; cycle_: string; funds: string;
      join: string; joinDetail: string; depositBtn: string; start: string; selectWinner: string;
      claimPayout: string; claimFinal: string; claimFinalDetail: string; drawGacha: string;
      collateralInfo: string; collateralInfoBody: string;
      yield_: string; blendStaked: string; blendStakedSub: string; poolGacha: string; poolGachaSub: string;
      collateral_: string; collateralSub: string; collatPerMember: string; collatPerMemberSub: string;
      participants: string; tickets: string; paid: string; winner: string;
      cycleWinners: string; cycleLabel: string;
      yourStatus: string; activeParticipant: string; activeParticipantDesc: string; notParticipant: string; notParticipantDesc: string;
      quickActions: string; contract: string; tripleYield: string; tripleYieldDesc: string;
      harvestBtn: string; noticeLabel: string;
    };
    yield_: {
      title: string; badge: string; headline: string; description: string;
      liveData: string; liveDataSub: string; tvlBlend: string; totalYield: string;
      pillar1Title: string; pillar1Desc: string; pillar1Alloc: string;
      pillar2Title: string; pillar2Desc: string; pillar2Live: string;
      pillar3Title: string; pillar3Desc: string; pillar3Alloc: string;
      memberYields: string; searchAddr: string; myAccumulated: string;
      totalGacha: string; totalMerata: string; totalVault: string;
      harvestAll: string; harvest: string; otherMembers: string; poolLabel: string;
      memberAddrPool: string; gacha: string; merata: string; vault: string; simulate: string;
      blendInfo: string; blendInfo1: string; blendInfo2: string;
    };
    create: { title: string; poolName: string; contribution: string; maxMembers: string; collateralRatio: string; roundDuration: string; slashGrace: string; createBtn: string; creating: string; feeNotice: string };
    simulator: { title: string; depositLabel: string; membersLabel: string; cyclesLabel: string };
    leaderboard: { title: string; rank: string; address: string; points: string; streak: string };
    profile: { title: string; reputation: string; poolsJoined: string; totalContributed: string };
    faq: { title: string };
    faucet: { title: string; claimBtn: string; claiming: string; balance: string };
    dashboard: { title: string; myPools: string; noPools: string };
    gacha: { title: string; jackpot: string; tickets: string; drawDate: string };
  };
}
