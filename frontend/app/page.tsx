import { Retakan } from "@/components/sections/Retakan";
import { Tempaan } from "@/components/sections/Tempaan";
import { Nyala } from "@/components/sections/Nyala";
import { Sistem } from "@/components/sections/Sistem";
import { Galeri } from "@/components/sections/Galeri";
import { Bukti } from "@/components/sections/Bukti";
import { Cta } from "@/components/sections/Cta";
import { Marquee } from "@/components/ui/Marquee";
import { SceneDeck } from "@/components/scenes/SceneDeck";
import { SceneHero } from "@/components/scenes/SceneHero";
import { SceneAkar } from "@/components/scenes/SceneAkar";
import { ScenePercikan } from "@/components/scenes/ScenePercikan";

const KEYWORDS = [
  "ROSCA reimagined",
  "On-chain trust",
  "125% collateral",
  "Triple yield",
  "Gacha jackpot",
  "Verifiable randomness",
  "Built on Stellar",
  "Arisan, evolved",
];

export default function Home() {
  return (
    <main className="relative z-10">
      {/* ========== HERO ========== */}
      <SceneDeck scenes={[SceneHero, SceneAkar, ScenePercikan]} />

      {/* ========== SECTION 1: Retakan ========== */}
      <Retakan />

      <Marquee items={KEYWORDS} />

      {/* ========== SECTION 2: Tempaan ========== */}
      <div style={{ background: "rgba(10,157,110,0.05)" }}>
        <Tempaan />
      </div>

      {/* ========== SECTION 3: Nyala ========== */}
      <div style={{ background: "rgba(10,157,110,0.045)" }}>
        <Nyala />
      </div>

      {/* ========== SECTION 4: Sistem ========== */}
      <div style={{ background: "rgba(12,140,233,0.05)" }}>
        <Sistem />
      </div>

      {/* ========== SECTION 5: Galeri ========== */}
      <div style={{ background: "rgba(12,140,233,0.045)" }}>
        <Galeri />
      </div>

      {/* ========== SECTION 6: Bukti ========== */}
      <div style={{ background: "rgba(10,157,110,0.05)" }}>
        <Bukti />
      </div>

      {/* ========== SECTION 7: CTA ========== */}
      <div style={{ background: "rgba(12,140,233,0.07)" }}>
        <Cta />
      </div>
    </main>
  );
}
