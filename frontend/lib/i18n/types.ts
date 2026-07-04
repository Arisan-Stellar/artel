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
}
